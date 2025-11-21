import * as cheerio from "cheerio";
import hash from "object-hash";
import { verifyCookie } from "./verifyCookie.js";
import { log } from "console";

function chunkArray(array: Array<any>, size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export async function getGrades(
    logToken: string,
    ano: number,
    APIToken?: string
) {
    const testTokenResult = await verifyCookie(logToken, APIToken);

    if (testTokenResult == false) {
        return false;
    } else {
        logToken = testTokenResult;
    }

    const response = await fetch("http://200.145.153.1/nsac/aluno/boletim", {
        credentials: "include",
        headers: {
            Cookie: logToken,
        },
        referrer: "http://200.145.153.1/nsac/login",
        method: "GET",
        mode: "cors",
    });

    const boletimHtml = await response.text();

    const $ = cheerio.load(boletimHtml);
    const userCurrentYear = $("table").length; // quantidade de tabelas = ano atual (3 tabelas = 3 anos)
    const anoIndex = userCurrentYear - ano;
    if (isNaN(ano) || !ano) ano = userCurrentYear;
    if (ano > userCurrentYear) ano = userCurrentYear;
    console.log({
        logToken,
        ano,
        APIToken,
        userCurrentYear
    })

    const topTable = $("table")[anoIndex] ?? $("table")[0];
    const tBody = $(topTable).find("tbody tr");
    const titles = $(tBody)
        .find("td span")
        .text()
        .trim()
        .split("\n")
        .filter((_, i) => i % 2 == 0)
        .map((value) => value.trim());

    let userGrades = $(tBody)
        .find("td span")
        .text()
        .trim()
        .split("\n")
        .filter((_, i) => (i + 1) % 2 == 0)
        .map((value) => value.trim().replace(/[A-Za-z* ]+/g, "-"));

    let badGrades: Array<string> = [];
    let userArray: Array<Array<string>> = [];

    $(tBody)
        .find("td")
        .each((_, ele) => {
            if ($(ele).children().prop("tagName") != "SPAN") {
                badGrades.push($(ele).text());
            }
        });

    userGrades.forEach((value) => {
        userArray.push(value.slice(0, -1).split("-"));
    });

    let finalGrades = chunkArray(
        badGrades.filter((_, i) => i % 2 == 0),
        5
    );
    finalGrades.forEach((val) => val.pop());

    let grades: Array<object> = [];
    let finalUserGrades: Array<object> = [];
    let hashes: Array<string> = [];
    let userHashes: Array<string> = [];

    if (titles.length != finalGrades.length) return false;
    else {
        for (let i = 0; i < finalGrades.length; i++) {
            grades.push({
                name: titles[i],
                grades: finalGrades[i],
            });
            finalUserGrades.push({
                name: titles[i],
                grades: userArray[i],
            });
            hashes[i] = hash(grades[i] as hash.NotUndefined);
            userHashes[i] = hash(userGrades[i] as hash.NotUndefined);
        }
    }

    return {
        generalGrades: grades,
        gradesLenght: titles.length,
        generalHashes: hashes,
        userGrades: finalUserGrades,
        userCurrentYear: userCurrentYear,
        userHashes: userHashes,
    };
}
