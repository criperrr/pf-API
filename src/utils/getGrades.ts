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
    ano: number,
    APIToken?: string
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

    const tables = $("div.box.box-primary").toArray().reverse();
    const userCurrentYear = tables.length;
    const MAX_BIMESTERS = 4;

    let warning: string | boolean = false;

    if (isNaN(ano) || !ano) {
        throw new AppError(
            "Invalid 'year' parameter",
            400,
            "INVALID_PARAM",
            "year"
        );
    }

    // Se o usuário pedir o 3º ano, mas só está no 2º, pegamos o último disponível (o atual)
    let targetYearIndex: number;

    if (ano > userCurrentYear) {
        warning = `Given year (${ano}) is bigger than userCurrentYear (${userCurrentYear}). Using userCurrentYear to scrap!`;
        // O índice 0 é sempre a tabela mais recente (topo da página)
        targetYearIndex = 0;
    } else {
        // Inverte a lógica
        targetYearIndex = userCurrentYear - ano;
    }

    const targetTable = tables[targetYearIndex];

    if (!targetTable) {
        throw new AppError("Year not found", 404, "NOT_FOUND", "year");
    }

    // Processamento da Tabela Alvo (Scraping Otimizado)
    const titlesString = $(targetTable)
        .find("div.box-header")
        .find("h4")
        .text()
        .trim()
        .replace(/\s/g, "")
        .split("/");

    let yearLabel = titlesString[1];
    const tittleLabel = titlesString[0];

    if (!yearLabel)
        throw new Error("Erro ao extrair ano do cabeçalho da tabela");

    let status = yearLabel.split("-");
    if (status.length > 1) {
        yearLabel = status[0];
    } else {
        status[1] = "Cursando.";
    }

    // Limpeza visual do header para extração (remove colunas extras)
    $(targetTable)
        .find("thead tr:not(#contador) th")
        .last()
        .remove()
        .end()
        .first()
        .remove();

    let fullGradesObj: FullGrades[] = [];
    let resultDataObj: ResultData = {
        // Placeholder para dados finais globais
        gradeName: "",
        grade: 0,
        totalAbsences: 0,
    };

    // Inicializa acumuladores verticais
    const bimesterAccumulators = Array.from({ length: MAX_BIMESTERS }, () => ({
        totalUserGrade: 0,
        countUserGrades: 0,
        totalClassGrade: 0,
        countClassGrades: 0,
        totalAbsences: 0,
    }));

    // Itera sobre as disciplinas (linhas)
    $(targetTable)
        .find("tr.linha")
        .each((_, row) => {
            const schoolSubject = getSubjectName($, row);

            let currentSubject: FullGrades = {
                gradeName: schoolSubject,
                userGrades: [],
                classGrades: [],
            };

            const cells = $(row).find("td.text-center");
            const map: Record<number, string> = {
                0: "userGrade",
                1: "classGrade",
                2: "absences",
                3: "recoveryStatus",
            };

            cells.each((cellIndex, cell) => {
                const currentBimester = Math.floor(cellIndex / MAX_BIMESTERS);

                // Células de bimestre (0 a 15)
                if (cellIndex < 16) {
                    const cellType = map[cellIndex % MAX_BIMESTERS];

                    // Inicializa arrays se vazios
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
                                // Acumulador Vertical
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
                                // Acumulador Vertical
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
                                // Acumulador Vertical
                                bimesterAccumulators[
                                    currentBimester
                                ]!.totalAbsences += absences;
                            }
                            break;

                        case "recoveryStatus":
                            const lastSpanChild = $(cell).children().last();
                            const completeStatus =
                                $(lastSpanChild).attr("title")?.toString() ||
                                "Não aconteceu";
                            let statusCode = $(lastSpanChild).text().trim();
                            if (statusCode === "-") statusCode = "NAC";
                            const recoveryBool = ["SAT", "INS", "NC"].includes(
                                statusCode
                            );
                            let currentUserGrades =
                                currentSubject.userGrades[currentBimester];
                            if (recoveryBool) {
                                currentSubject.userGrades[currentBimester] = {
                                    ...currentUserGrades,
                                    recovery: recoveryBool,
                                    recovered: currentUserGrades.grade >= 6,
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

                                currentSubject.userGrades[currentBimester] = {
                                    ...cleanGrades,
                                    recovery: false, 
                                };
                            }

                            break;
                    }
                }
                // Colunas Finais (Média Final e Faltas Totais da Matéria)
                else {
                    // to rewrite
                }
            });

            fullGradesObj.push(currentSubject);
        });

    // Calcula médias dos bimestres
    const calculatedBimesterData: BimesterData[] = bimesterAccumulators.map(
        (acc) => ({
            userAvarage:
                acc.countUserGrades > 0
                    ? Number(
                          (acc.totalUserGrade / acc.countUserGrades).toFixed(2)
                      )
                    : 0,
            classAvarage:
                acc.countClassGrades > 0
                    ? Number(
                          (acc.totalClassGrade / acc.countClassGrades).toFixed(
                              2
                          )
                      )
                    : 0,
            totalAbsences: acc.totalAbsences,
        })
    );

    const resultYearInfo: YearInfo = {
        tittle: tittleLabel!,
        year: Number(yearLabel),
        status: status[1]!,
        grades: fullGradesObj,
        bimestersData: calculatedBimesterData,
        results: [],
    };

    return {
        warning,
        userCurrentYear,
        data: resultYearInfo,
    };
}
