import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import verifyEmptyFields from "../utils/emptyFields.js";
import { encrypt, generateRandomString, decrypt } from "../utils/crypto.js";
import db, { getSql, runSql, queryOne, insertSql } from "../utils/database.js";
import { ApiToken } from "../models/ApiToken.js";
import { login } from "../utils/loginNsac.js";
import { getGrades } from "../utils/getGrades.js";
import {
    ApiResponse,
    BasicNsacApiRequest,
    NsacApiResponse,
    NsacToken,
    NsacTokensResponse,
} from "../types/index.js";
import { failure, singleError, success } from "../utils/responseHelpers.js";
import { AppError, MultiAppErrors } from "../types/ApiError.js";

interface nsacAccountRequest {
    email: string;
    userId: string;
    password: string;
}

interface jwtTokenPayload {
    id_User: string;
    email: string;
}

interface queryPayload {
    apiToken?: string;
    ano?: number;
}

export async function createToken(
    req: Request<{}, ApiResponse<NsacApiResponse>, BasicNsacApiRequest>,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, password } = req.body;
        const jwtToken = req.headers.authorization?.split(" ")[1] as string;

        const payload = jwt.decode(jwtToken) as jwtTokenPayload; // n pode ser null porque passa pelo middlware que valida ele.

        if (!payload || !payload.id_User)
            throw new AppError(
                "Invalid JWT token",
                401,
                "AUTH_MISSING_PAYLOAD"
            );

        const userId = payload.id_User;

        const emptyFields = verifyEmptyFields({ email, password, userId });
        if (emptyFields.length != 0) {
            const errors = emptyFields.map((field) => ({
                field: field,
                message: `Empty field ${field}`,
                code: "AUTH_MISSING_FIELD",
            }));
            throw new MultiAppErrors(errors);
        }
        // Valida se as credenciais funcionam no sistema NSAC
        const loginNsac = await login(email, password);

        const encryptedPassword = encrypt(password);
        const encryptedCookie = encrypt(loginNsac);
        const apiToken = generateRandomString(32).toUpperCase();

        let nsacAccountId: number;

        const existingAccount = await queryOne<{ id_NsacAccount: number }>(
            "SELECT id_NsacAccount FROM NsacAccount WHERE email = ?",
            [email],
            db
        );

        if (existingAccount) {
            console.log("Email já registrado. Usando ID existente.");
            nsacAccountId = existingAccount.id_NsacAccount;
        } else {
            nsacAccountId = await insertSql(
                "INSERT INTO NsacAccount(email, password) VALUES (?, ?)",
                [email, encryptedPassword],
                db
            );
            console.log("Novo email registrado.");
        }

        if (!nsacAccountId) throw new Error("Failed to resolve nsacAccountId while creating token.");

        await runSql(
            "DELETE FROM apiToken WHERE id_User = ? AND id_NsacAccount = ?",
            [userId, nsacAccountId.toString()],
            db
        );

        const apiTokenId = await insertSql(
            "INSERT INTO apiToken(id_User, id_NsacAccount, cookieString, token) VALUES (?, ?, ?, ?)",
            [userId, nsacAccountId, encryptedCookie, apiToken],
            db
        );

        if (!apiTokenId) throw new Error("Failed to insert apiToken while creating token.");

        const data = {
            userId: userId,
            nsacAccountId: nsacAccountId,
            apiToken: apiToken,
        };

        return res.status(200).json(success(data));
    } catch (err: any) {
        next(err);
    }
}

export async function getTokens(
    req: Request<{}, ApiResponse<NsacTokensResponse>>,
    res: Response
) {
    const jwtToken = req.headers.authorization?.split(" ")[1] as string;
    const payload = jwt.decode(jwtToken) as jwtTokenPayload;
    const userId = payload.id_User;

    try {
        const apiTokenIds = await getSql<NsacToken>(
            "SELECT token, id_NsacAccount FROM apiToken WHERE id_User = ?",
            [userId],
            db
        );

        const data: NsacTokensResponse = {
            ...apiTokenIds,
        };

        res.status(200).json(success(data));
    } catch (err) {
        console.log(err);
        return res
            .status(500)
            .json(singleError("Internal server errror", "API_SERVER_ERROR"));
    }
}

export async function checkApiKeyAuth(req: Request, res: Response) {
    const APIToken = req.headers["x-api-token"] as string;

    if (!APIToken)
        return res
            .status(401)
            .json(singleError("No API Token provided", "AUTH_NO_API_TOKEN"));

    try {
        const apiTokenId = await runSql(
            "SELECT * FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        console.log(apiTokenId);
        if (apiTokenId > 0) {
            return res.status(200).json({ data: { message: "Valid token!" } });
        } else {
            return res.status(401).json({ error: "Invalid API Token." });
        }
    } catch (err: any) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteTokens(req: Request, res: Response) {
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
        const tokenData = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );

        if (!tokenData) {
            return res
                .status(401)
                .json({ error: "Token inválido ou não encontrado." });
        }
        const { cookieString } = tokenData;
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
        const tokenData = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );

        if (!tokenData) {
            return res
                .status(401)
                .json({ error: "Token inválido ou não encontrado." });
        }
        const { cookieString } = tokenData;
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
        const tokenData = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );

        if (!tokenData) {
            return res
                .status(401)
                .json({ error: "Token inválido ou não encontrado." });
        }
        const { cookieString } = tokenData;

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
