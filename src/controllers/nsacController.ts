import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import verifyEmptyFields from "../utils/emptyFields.js";
import { encrypt, generateRandomString, decrypt } from "../utils/crypto.js";
import db, { getSql, runSql, queryOne } from "../utils/database.js";
import { ApiToken } from "../models/ApiToken.js";
import { login } from "../utils/loginNsac.js";
import { getGrades } from "../utils/getGrades.js";

interface nsacAccountRequest {
    email: string;
    userId: string;
    password: string;
}

interface ApiResponse {
    errors?: Array<Object>;
    data?: {
        message?: string;
        userId?: string;
        nsacAccountId?: number;
        apiToken?: string;
    };
}

interface jwtTokenPayload {
    id_User: string;
    email: string;
}

interface queryPayload {
    apiToken?: string;
    ano?: number;
}

export async function createToken(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }
    let response: ApiResponse = {
        errors: [],
        data: {},
    };

    const { email, password } = req.body as nsacAccountRequest;
    const jwtToken = req.headers.authorization?.split(" ")[1] as string;
    const payload = jwt.decode(jwtToken) as jwtTokenPayload;
    const userId = payload.id_User;

    const emptyFields = verifyEmptyFields({ email, password, userId });
    if (emptyFields.length != 0) {
        response.errors = emptyFields.map((field) => ({
            field: field,
            error: `Empty field ${field}`,
        }));
        return res.status(400).json(response);
    }

    try {
        const loginNsac = await login(email, password);

        const encryptedPassword = encrypt(password);
        const encryptedCookie = encrypt(loginNsac);
        const apiToken = generateRandomString(32).toUpperCase();

        const nsacAccountId = await runSql(
            "INSERT INTO NsacAccount(email, password) VALUES (?, ?)",
            [email, encryptedPassword],
            db
        );

        if (!nsacAccountId) throw new Error("Failed to insert NsacAccount");

        const apiTokenId = await runSql(
            "INSERT INTO apiToken(id_User, id_NsacAccount, cookieString, token) VALUES (?, ?, ?, ?)",
            [
                userId.toString(),
                nsacAccountId.toString(),
                encryptedCookie,
                apiToken,
            ],
            db
        );

        if (!apiTokenId) throw new Error("Failed to insert apiToken");

        response.data = {
            userId: userId,
            nsacAccountId: nsacAccountId,
            apiToken: apiToken,
        };
        response.errors = [];

        return res.status(200).json(response);
    } catch (err: any) {
        if (err.message.includes("UNIQUE constraint failed")) {
            response.errors = [
                {
                    error: "Already registered email.",
                },
            ];
        } else if (err.message.includes("Wrong NSAC email or password")) {
            response.errors = [
                {
                    error: "Wrong NSAC email or password",
                },
            ];
        } else {
            response.errors = [
                {
                    error: "Internal server error",
                },
            ];
        }
        console.log(err);
        return res.status(500).json(response);
    }
}

export async function getTokens(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }
    let response = {
        errors: [{}],
        data: {},
    };
    const jwtToken = req.headers.authorization?.split(" ")[1] as string;
    const payload = jwt.decode(jwtToken) as jwtTokenPayload;
    const userId = payload.id_User;

    console.log({
        jwtToken,
        payload,
        userId,
    });

    try {
        const apiTokenIds = await getSql(
            "SELECT token, id_NsacAccount FROM apiToken WHERE id_User = ?",
            [userId],
            db
        );
        console.log(apiTokenIds);

        response.data = {
            ...apiTokenIds,
        };

        res.status(200).json({ apiTokenIds });
    } catch (err) {
        response.errors = [
            {
                error: "Internal server error",
            },
        ];
        console.log(err);
        return res.status(500).json(response);
    }
}

export async function deleteTokens(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }

    let response: ApiResponse = {
        errors: [],
        data: {},
    };

    const { token } = req.body;

    console.log({
        token,
    });

    try {
        const resultQuery = await runSql(
            "DELETE FROM apiToken WHERE token = ? ",
            [token],
            db
        );
        console.log(resultQuery);

        if (resultQuery > 0) {
            response.data = {
                message:
                    "Success! Token unliked from your account and deleted from DB.",
            };
            return res.status(200).json(response);
        } else {
            response.errors = [
                {
                    error: "Nothing was changed (wrong API Key?)",
                },
            ];
            return res.status(404).json(response);
        }
    } catch (err) {
        response.errors = [
            {
                error: "Internal server error",
            },
        ];
        console.log(err);
        return res.status(500).json(response);
    }
}

export async function getClassGrades(req: Request, res: Response) {
    let response = {
        errors: [{}],
        data: {},
    };
    const apiToken = req.headers["x-api-token"] as string;

    const { ano }: queryPayload = req.query;
    if (!apiToken || !ano) {
        return res.status(400).json({ error: "Faltando parametros na URL" });
    }
    const anoNumero = Number(ano);
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, anoNumero, apiToken);
        if (!grades) throw new Error();

        response.data = {
            generalHashes: grades.generalHashes,
            generalGrades: grades.generalGrades,
        };

        res.status(200).json(response);
    } catch (err) {
        response.errors = [
            {
                error: "Internal server error",
            },
        ];
        console.log(err);
        return res.status(500).json(response);
    }
}

export async function getPrivateGrades(req: Request, res: Response) {
    let response = {
        errors: [{}],
        data: {},
    };
    const apiToken = req.headers["x-api-token"] as string;

    const { ano }: queryPayload = req.query;
    if (!apiToken || !ano) {
        return res.status(400).json({ error: "Faltando parametros na URL" });
    }
    const anoNumero = Number(ano);
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, anoNumero, apiToken);
        if (!grades) throw new Error();

        response.data = {
            userCurrentYear: grades.userCurrentYear,
            userHashes: grades.userHashes,
            userGrades: grades.userGrades,
        };

        res.status(200).json(response);
    } catch (err) {
        console.log(err);

        response.errors = [
            {
                error: "Internal server error",
            },
        ];
        console.log(err);
        return res.status(500).json(response);
    }
}

export async function getAllGrades(req: Request, res: Response) {
    let response = {
        errors: [{}],
        data: {},
    };

    const apiToken = req.headers["x-api-token"] as string;

    const { ano }: queryPayload = req.query;

    if (!ano) {
        return res.status(400).json({ error: "Faltando parametros na URL" });
    }
    const anoNumero = Number(ano);
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, anoNumero, apiToken);
        if (!grades) throw new Error();

        response.data = {
            ...grades,
        };

        res.status(200).json(response);
    } catch (err: any) {
        if (err.message.includes("Invalid year URL parameter.")) {
            response.errors = [
                {
                    error: err.message,
                },
            ];
            console.log(err);
            return res.status(400).json(response);
        } else {
            response.errors = [
                {
                    error: "Internal server error",
                },
            ];
        }

        console.log(err);
        return res.status(500).json(response);
    }
}
