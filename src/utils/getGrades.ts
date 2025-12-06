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
} from "../types/index.js";

function getSubjectName(
    $: cheerio.CheerioAPI,
    row: cheerio.BasicAcceptedElems<any>
): string {
    let schoolSubject: any = $(row).find("td:not(.text-center) span");
    const schoolSubjectAtrr = $(schoolSubject).attr("title");
    if (schoolSubjectAtrr) {
        return schoolSubjectAtrr.toString();
    } else {
        return $(schoolSubject).text().trim();
    }
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

export async function getGrades(
    logToken: string,
    APIToken?: string,
    year?: number
) {
    const tokenResult = await verifyCookie(logToken, APIToken);

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
    const $ = cheerio.load(boletimHtml);

    const tables = $("div.box.box-primary").toArray();
    const userCurrentYear = tables.length;
    const MAX_BIMESTERS = 4;

    if (year === 0) {
        year++;
    }

    let warning: string | boolean = false;
    let allYearsInfo: YearInfo[] = [];
    tables.forEach((table) => {
        const titlesString = $(table)
            .find("div.box-header")
            .find("h4")
            .text()
            .trim()
            .replace(/\s/g, "")
            .split("/");

        let yearLabel = titlesString[1];
        const tittleLabel = titlesString[0];

        if (!yearLabel) {
            throw new Error("Erro ao extrair ano do cabeçalho da tabela");
        }

        let status = yearLabel.split("-");
        if (status.length > 1) {
            yearLabel = status[0];
        } else {
            status[1] = "Cursando.";
        }

        const parsedYear = Number(yearLabel);

        let fullGradesObj: FullGrades[] = [];
        const bimesterAccumulators = Array.from(
            { length: MAX_BIMESTERS },
            () => ({
                totalUserGrade: 0,
                countUserGrades: 0,
                totalClassGrade: 0,
                countClassGrades: 0,
                totalAbsences: 0,
            })
        );
        $(table)
            .find("tr.linha")
            .each((_, row) => {
                const schoolSubject = getSubjectName($, row);

                let resultDataObj: ResultData = {
                    grade: 0,
                    totalAbsences: 0,
                };

                let currentSubject: FullGrades = {
                    gradeName: schoolSubject,
                    userGrades: [],
                    classGrades: [],
                    results: resultDataObj,
                };

                const cells = $(row).find("td.text-center");
                const map: Record<number, string> = {
                    0: "userGrade",
                    1: "classGrade",
                    2: "absences",
                    3: "recoveryStatus",
                };

                cells.each((cellIndex, cell) => {
                    const currentBimester = Math.floor(
                        cellIndex / MAX_BIMESTERS
                    );

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
                                avarageGrade: 0,
                            };
                        }

                        switch (cellType) {
                            case "userGrade":
                                const userGradeValue = extractAndCleanGrade(
                                    $(cell).text()
                                );
                                if (userGradeValue !== null) {
                                    currentSubject.userGrades[
                                        currentBimester
                                    ].grade = userGradeValue;
                                    bimesterAccumulators[
                                        currentBimester
                                    ]!.totalUserGrade += userGradeValue;
                                    bimesterAccumulators[currentBimester]!
                                        .countUserGrades++;
                                }
                                break;

                            case "classGrade":
                                const classGradeValue = extractAndCleanGrade(
                                    $(cell).text()
                                );
                                if (classGradeValue !== null) {
                                    currentSubject.classGrades[
                                        currentBimester
                                    ].avarageGrade = classGradeValue;
                                    bimesterAccumulators[
                                        currentBimester
                                    ]!.totalClassGrade += classGradeValue;
                                    bimesterAccumulators[currentBimester]!
                                        .countClassGrades++;
                                }
                                break;

                            case "absences":
                                const absences = Number($(cell).text().trim());
                                if (!isNaN(absences)) {
                                    currentSubject.userGrades[
                                        currentBimester
                                    ].absences = absences;
                                    bimesterAccumulators[
                                        currentBimester
                                    ]!.totalAbsences += absences;
                                }
                                break;

                            case "recoveryStatus":
                                const lastSpanChild = $(cell).children().last();
                                const completeStatus =
                                    $(lastSpanChild)
                                        .attr("title")
                                        ?.toString() || "Não aconteceu";
                                let statusCode = $(lastSpanChild).text().trim();
                                if (statusCode === "-") statusCode = "NAC";
                                const recoveryBool = [
                                    "SAT",
                                    "INS",
                                    "NC",
                                ].includes(statusCode);
                                let currentUserGrades =
                                    currentSubject.userGrades[currentBimester];
                                if (recoveryBool) {
                                    currentSubject.userGrades[currentBimester] =
                                        {
                                            ...currentUserGrades,
                                            recovery: recoveryBool,
                                            recovered:
                                                currentUserGrades.grade >= 6,
                                            recoveryCode:
                                                statusCode as recoveryStatusCode,
                                            recoveryMessage:
                                                completeStatus as recoveryMessages,
                                        };
                                } else {
                                    const {
                                        recovered,
                                        recoveryCode,
                                        recoveryMessage,
                                        ...cleanGrades
                                    } = currentUserGrades;
                                    currentSubject.userGrades[currentBimester] =
                                        {
                                            ...cleanGrades,
                                            recovery: false,
                                        };
                                }
                                break;
                        }
                    } else {
                        if (cellIndex == 16) {
                            const finalGrade = extractAndCleanGrade(
                                $(cell).text()
                            );
                            if (finalGrade === null)
                                throw new Error("INVALID FINAL GRADE!");
                            resultDataObj.grade = finalGrade;
                        } else if (cellIndex == 17) {
                            const totalAbsences = Number($(cell).text().trim());
                            if (isNaN(totalAbsences))
                                throw new Error(
                                    "INVALID FINAL ABSENCES GRADE!"
                                );
                            resultDataObj.totalAbsences = totalAbsences;
                        }
                    }
                });

                fullGradesObj.push(currentSubject);
            });

        const calculatedBimesterData: BimesterData[] = bimesterAccumulators.map(
            (acc) => ({
                userAvarage:
                    acc.countUserGrades > 0
                        ? Number(
                              (
                                  acc.totalUserGrade / acc.countUserGrades
                              ).toFixed(2)
                          )
                        : 0,
                classAvarage:
                    acc.countClassGrades > 0
                        ? Number(
                              (
                                  acc.totalClassGrade / acc.countClassGrades
                              ).toFixed(2)
                          )
                        : 0,
                totalAbsences: acc.totalAbsences,
            })
        );

        const resultYearInfo: YearInfo = {
            tittle: tittleLabel!,
            year: parsedYear,
            status: status[1]!,
            grades: fullGradesObj,
            bimestersData: calculatedBimesterData,
        };

        allYearsInfo.push(resultYearInfo);
    });

    if (year) {
        if (year > userCurrentYear) {
            year = userCurrentYear;
        }
        if (year < 0) {
            console.log({ year, userCurrentYear });
            year = (year + userCurrentYear) * -1; // segundo ano: -1 => 1; -2 => 0 => 1
            console.log({ year, userCurrentYear });
        }
        if (year === 0) year++;
        const yearIndex = userCurrentYear - year; // pra pegar o index: o ano que ele tá - ano q ele quer ; ex, segundo ano: 2-2=0, 2-1=1
        const filteredYear = allYearsInfo[yearIndex];
        const tittle = filteredYear!.tittle;
        console.log({
            year,
            yearIndex,
            tittle,
        });
        if (!filteredYear) {
            throw new AppError("Year not found", 404, "YEAR_NOT_FOUND");
        }
        return {
            warning,
            userCurrentYear,
            data: filteredYear,
        };
    }

    return {
        warning,
        userCurrentYear,
        data: allYearsInfo,
    };
}
