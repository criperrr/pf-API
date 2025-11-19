import { NsacAccount } from "../models/nsacAccount.js";
import { encrypt } from "./crypto.js";
import db, { getSql, runSql } from "./database.js";
import { login } from "./loginNsac.js";

export async function verifyCookie(
    token: string,
    APIToken?: string
): Promise<false | string> {
    const responseTest = await fetch("http://200.145.153.1/nsac/home", {
        credentials: "include",
        headers: {
            Cookie: token,
        },
        method: "GET",
        redirect: "manual",
    });

    if (responseTest.status == 200) return token;
    else {
        if (APIToken) {
            try {
                const { email, password } = await getSql<NsacAccount>(
                    `SELECT
                        NA.email,
                        NA.password
                    FROM
                        ApiToken AT
                    INNER JOIN
                        NsacAccount NA ON AT.id_NsacAccount = NA.id_NsacAccount
                    WHERE
                        AT.token = ?`,
                    [APIToken],
                    db
                );
                const newCookie = (await login(email, password)) as string;
                const encryptedCookie = encrypt(newCookie);

                await runSql(
                    "INSERT INTO ApiToken(token) VALUES (?)",
                    [encryptedCookie],
                    db
                );
                return encryptedCookie;
            } catch (err) {
                return false; // retorna falso ao inves de lançar exceção em tudo
            }
        }
        return false; // n lança exceção
    }
}
