import * as cheerio from "cheerio";
import { verifyCookie } from "./verifyCookie.js";
import { AppError } from "../types/ApiError.js";
import {
    FullGrades,
    recoveryMessages,
    recoveryStatusCode,
    ResultData,
    YearInfo,
    BimesterData,
    AllYearsInfo,
} from "../types/index.js";
import { AnyNode } from "domhandler";
interface BasicYearInfo {
    tittleLabel: string;
    parsedYear: number;
    parsedStatus: string;
}

function getSubjectName($: cheerio.CheerioAPI, row: cheerio.BasicAcceptedElems<any>): string {
    let schoolSubject: any = $(row).find("td:not(.text-center) span");
    const schoolSubjectAtrr = $(schoolSubject).attr("title");
    if (schoolSubjectAtrr) {
        return schoolSubjectAtrr.toString();
    } else {
        return $(schoolSubject).text().trim();
    }
}

function getBasicYearInfo(
    $: cheerio.CheerioAPI,
    table: cheerio.BasicAcceptedElems<AnyNode>
): BasicYearInfo {
    const titlesString = $(table)
        .find("div.box-header")
        .find("h4")
        .text()
        .trim()
        .replace(/\s/g, "")
        .split("/");

    let yearLabel = titlesString[1];
    const tittleLabel = titlesString[0]!;

    if (!yearLabel) {
        throw new Error("Erro ao extrair ano do cabeçalho da tabela");
    }

    let status = yearLabel.split("-");
    let parsedStatus: string;
    if (status.length > 1) {
        yearLabel = status[0];
        parsedStatus = status[1]!;
    } else {
        parsedStatus = "Cursando.";
    }

    const parsedYear = Number(yearLabel);
    return {
        tittleLabel,
        parsedYear,
        parsedStatus,
    };
}

function extractAndCleanGrade(pollutedString: string) {
    const regex = /(\d+\.?\d?)/;
    const match = pollutedString.match(regex);

    if (match && match[0]) {
        let cleanedString = match[0];
        cleanedString = cleanedString.replace(/[^\d.]/g, "");
        return Number(cleanedString);
    }
    return null;
}

async function fetchBoletimDOM(
    logToken: string, // Token de login
    APIToken?: string // Token da API
): Promise<cheerio.CheerioAPI> {
    const tokenResult = await verifyCookie(logToken, APIToken); // Se o logToken for invalido mas o APIToken n, ent ele retorna um logToken novo

    const response = await fetch("http://200.145.153.1/nsac/aluno/boletim", {
        credentials: "include",
        headers: {
            Cookie: tokenResult,
        },
        referrer: "http://200.145.153.1/nsac/login",
        method: "GET",
        mode: "cors",
    });

    const boletimHtml = await response.text();
    return cheerio.load(boletimHtml);
}

export async function getGrades(logToken: string, APIToken?: string, year?: number): Promise<AllYearsInfo> {
    const MAX_BIMESTERS = 4;
    const $ = await fetchBoletimDOM(logToken, APIToken);

    const tables = $("div.box.box-primary").toArray().reverse();
    const userCurrentYear = tables.length;

    if (year === 0) year = userCurrentYear;

    let warning: string | boolean = false;
    let allYearsInfo: YearInfo[] = [];
    tables.forEach((table) => {
        const { parsedYear, tittleLabel, parsedStatus } = getBasicYearInfo($, table);

        let fullGradesObj: FullGrades[] = [];
        const bimesterAccumulators = Array.from({ length: MAX_BIMESTERS }, () => ({
            totalUserGrade: 0,
            countUserGrades: 0,
            totalClassGrade: 0,
            countClassGrades: 0,
            totalAbsences: 0,
        }));
        $(table)
            .find("tr.linha")
            .each((_, row) => {
                const schoolSubject = getSubjectName($, row);

                let resultDataObj: ResultData = {
                    grade: 0,
                    totalAbsences: 0,
                };

                let currentSubject: FullGrades = {
                    subjectName: schoolSubject,
                    userGrades: [],
                    classGrades: [],
                    results: resultDataObj,
                };

                const cells = $(row).find("td.text-center");
                const map: Array<string> = [
                    "userGrade",
                    "classGrade",
                    "absences",
                    "recoveryStatus",
                ];

                cells.each((cellIndex, cell) => {
                    const currentBimester = Math.floor(cellIndex / MAX_BIMESTERS);

                    if (cellIndex < 16) {
                        const cellType = map[cellIndex % MAX_BIMESTERS];

                        if (!currentSubject.userGrades[currentBimester]) {
                            currentSubject.userGrades[currentBimester] = {
                                grade: 0,
                                recovered: false,
                                recovery: false,
                                recoveryCode: "NAC",
                                recoveryMessage: "Não aconteceu",
                                absences: 0,
                            };
                        }
                        if (!currentSubject.classGrades[currentBimester]) {
                            currentSubject.classGrades[currentBimester] = {
                                averageGrade: 0,
                            };
                        }

                        switch (cellType) {
                            case "userGrade":
                                const userGradeValue = extractAndCleanGrade($(cell).text());
                                if (userGradeValue !== null) {
                                    currentSubject.userGrades[currentBimester].grade =
                                        userGradeValue;
                                    bimesterAccumulators[currentBimester]!.totalUserGrade +=
                                        userGradeValue;
                                    bimesterAccumulators[currentBimester]!.countUserGrades++;
                                }
                                break;

                            case "classGrade":
                                const classGradeValue = extractAndCleanGrade($(cell).text());
                                if (classGradeValue !== null) {
                                    currentSubject.classGrades[currentBimester].averageGrade =
                                        classGradeValue;
                                    bimesterAccumulators[currentBimester]!.totalClassGrade +=
                                        classGradeValue;
                                    bimesterAccumulators[currentBimester]!.countClassGrades++;
                                }
                                break;

                            case "absences":
                                const absences = Number($(cell).text().trim());
                                if (!isNaN(absences)) {
                                    currentSubject.userGrades[currentBimester].absences = absences;
                                    bimesterAccumulators[currentBimester]!.totalAbsences +=
                                        absences;
                                }
                                break;

                            case "recoveryStatus":
                                const lastSpanChild = $(cell).children().last();
                                const completeStatus = ($(lastSpanChild)
                                    .attr("title")
                                    ?.toString() || "Não aconteceu") as recoveryMessages;
                                let statusCode = $(lastSpanChild).text().trim();
                                if (statusCode === "-") statusCode = "NAC";
                                const recoveryBool = ["SAT", "INS", "NC"].includes(statusCode);
                                let currentUserGrades = currentSubject.userGrades[currentBimester];
                                if (recoveryBool) {
                                    currentSubject.userGrades[currentBimester] = {
                                        ...currentUserGrades,
                                        recovery: recoveryBool,
                                        recovered: currentUserGrades.grade >= 6,
                                        recoveryCode: statusCode as recoveryStatusCode,
                                        recoveryMessage: completeStatus,
                                    };
                                } else {
                                    const {
                                        recovered,
                                        recoveryCode,
                                        recoveryMessage,
                                        ...cleanGrades
                                    } = currentUserGrades;
                                    currentSubject.userGrades[currentBimester] = {
                                        ...cleanGrades,
                                        recovery: false,
                                    };
                                }
                                break;
                        }
                    } else {
                        if (cellIndex == 16) {
                            const finalGrade = extractAndCleanGrade($(cell).text());
                            if (finalGrade === null) throw new Error("INVALID FINAL GRADE!");
                            resultDataObj.grade = finalGrade;
                        } else if (cellIndex == 17) {
                            const totalAbsences = Number($(cell).text().trim());
                            if (isNaN(totalAbsences))
                                throw new Error("INVALID FINAL ABSENCES GRADE!");
                            resultDataObj.totalAbsences = totalAbsences;
                        }
                    }
                });

                fullGradesObj.push(currentSubject);
            });

        const calculatedBimesterData: BimesterData[] = bimesterAccumulators.map((acc) => ({
            userAverage:
                acc.countUserGrades > 0
                    ? Number((acc.totalUserGrade / acc.countUserGrades).toFixed(2))
                    : 0,
            classAverage:
                acc.countClassGrades > 0
                    ? Number((acc.totalClassGrade / acc.countClassGrades).toFixed(2))
                    : 0,
            totalAbsences: acc.totalAbsences,
        }));

        const resultYearInfo: YearInfo = {
            tittle: tittleLabel!,
            year: parsedYear,
            status: parsedStatus,
            grades: fullGradesObj,
            bimestersData: calculatedBimesterData,
        };

        allYearsInfo.push(resultYearInfo);
    });

    return {
        warning,
        userCurrentYear,
        data: allYearsInfo,
    };
}
