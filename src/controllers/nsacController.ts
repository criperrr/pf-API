import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import verifyEmptyFields from "../utils/emptyFields.js";
import { encrypt, generateRandomString, decrypt } from "../utils/crypto.js";
import db, { getSql, runSql, queryOne, insertSql } from "../utils/database.js";
import { login } from "../utils/loginNsac.js";
import { getGrades } from "../utils/getGrades.js";
import { success } from "../utils/responseHelpers.js";
import { filterQuery } from "../services/nsacService.js";

import { ApiToken } from "../models/ApiToken.js";
import { Users } from "../models/users.js";

import { AppError } from "../types/ApiError.js";

import {
    ApiResponse,
    NsacToken,
    NsacTokensResponse,
    NsacAuthResponse,
    DeleteTokenResponse,
    JwtTokenPayload,
    BasicNsacApiRequest,
    DeleteTokenRequest,
    QueryFilter,
} from "../types/index.js";

export async function createToken(
    req: Request<{}, ApiResponse<NsacAuthResponse>, BasicNsacApiRequest>,
    res: Response,
    next: NextFunction
) {
    try {
        const { email, password } = req.body;

        // acho que é impossível chegar aq por causa dos middlewares mas pro typescript n encher o saco é isso ai

        const jwtToken = req.headers.authorization!.split(" ")[1];
        const masterToken = req.headers["x-master-token"] as string;

        if (!jwtToken && !masterToken) {
            throw new AppError(
                "Invalid JWT token format and no x-master-token provided",
                401,
                "AUTH_INVALID_PAYLOAD"
            );
        }

        let userId = "";
        if (!jwtToken && masterToken) {
            const { id_user } = await queryOne<Users>(
                "SELECT id_User FROM Users WHERE masterToken = ?",
                [masterToken],
                db
            );
            userId = id_user + "";
        }

        if ((jwtToken && !masterToken) || (jwtToken && masterToken)) {
            let payload = jwt.decode(jwtToken) as JwtTokenPayload;

            if (!payload || !payload.id_user) {
                throw new AppError("Invalid JWT token", 401, "AUTH_MISSING_PAYLOAD");
            }
            userId = payload.id_user;
        }

        verifyEmptyFields({ email, password, userId });

        const loginNsac = await login(email, password);

        const encryptedPassword = encrypt(password);
        const encryptedCookie = encrypt(loginNsac);
        const apiToken = generateRandomString(32).toUpperCase();

        let nsacAccountId: number;

        const existingAccount = await queryOne<{ id_nsacaccount: number }>(
            "SELECT id_NsacAccount FROM NsacAccount WHERE email = ?",
            [email],
            db
        );

        if (existingAccount) 
            nsacAccountId = existingAccount.id_nsacaccount;
         else {
            nsacAccountId = await insertSql(
                "INSERT INTO NsacAccount(id_User, email, password) VALUES (?, ?, ?) RETURNING id_NsacAccount",
                [userId, email, encryptedPassword],
                db
            );
        }

        if (!nsacAccountId) {
            throw new AppError(
                "Failed to resolve nsacAccountId while creating token.",
                500,
                "SERVER_DB_ERROR"
            );
        }

        await runSql(
            "DELETE FROM apiToken WHERE id_User = ? AND id_NsacAccount = ?",
            [userId, nsacAccountId],
            db
        );

        const apiTokenId = await insertSql(
            "INSERT INTO apiToken(id_User, id_NsacAccount, cookieString, token) VALUES (?, ?, ?, ?) RETURNING id_Token",
            [userId, nsacAccountId, encryptedCookie, apiToken],
            db
        );

        if (!apiTokenId) {
            throw new AppError(
                "Failed to insert apiToken while creating token.",
                500,
                "SERVER_DB_ERROR"
            );
        }

        const data: NsacAuthResponse = {
            message: "Token created successfully",
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
    res: Response,
    next: NextFunction
) {
    try {
        if (!req.headers.authorization) {
            throw new AppError("No Authorization header", 401, "AUTH_HEADER_MISSING");
        }

        const jwtToken = req.headers.authorization.split(" ")[1] as string;
        const payload = jwt.decode(jwtToken) as unknown as JwtTokenPayload;

        if (!payload || !payload.id_user) {
            throw new AppError("Invalid JWT payload", 401, "AUTH_INVALID_TOKEN");
        }

        const userId = payload.id_user;

        const apiTokens = await getSql<NsacToken>(
            "SELECT token, id_NsacAccount FROM apiToken WHERE id_User = ?",
            [userId],
            db
        );

        const data: NsacTokensResponse = apiTokens;

        res.status(200).json(success(data));
    } catch (err) {
        next(err);
    }
}

// Middleware-like function
export async function checkApiKeyAuth(req: Request, res: Response, next: NextFunction) {
    const APIToken = req.headers["x-api-token"] as string;

    try {
        if (!APIToken) {
            throw new AppError("No API Token provided", 401, "AUTH_NO_API_TOKEN");
        }

        const tokenExists = await queryOne(
            "SELECT 1 FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );

        if (tokenExists) {
            return res.status(200).send();
        } else {
            throw new AppError("Invalid token", 401, "INVALID_API_TOKEN");
        }
    } catch (err: any) {
        next(err);
    }
}

export async function deleteTokens(
    req: Request<{}, ApiResponse<DeleteTokenResponse>, DeleteTokenRequest>,
    res: Response,
    next: NextFunction
) {
    const { token } = req.body;

    try {
        if (!token) {
            throw new AppError("Token is required", 400, "MISSING_FIELD", "token");
        }

        const resultQuery = await runSql("DELETE FROM apiToken WHERE token = ? ", [token], db);

        if (resultQuery > 0) {
            return res.status(200).json(
                success({
                    message: "Success! Token unlinked from your account and deleted from DB.",
                })
            );
        } else {
            throw new AppError("Nothing was changed (wrong API Key?)", 404, "TOKEN_NOT_FOUND");
        }
    } catch (err) {
        next(err);
    }
}

export async function getApiGrades(
    req: Request<{}, ApiResponse<any>, {}, QueryFilter>,
    res: Response,
    next: NextFunction
) {
    const apiToken = req.headers["x-api-token"] as string;

    try {
        // if (
        //     privateGrades &&
        //     privateGrades != "false" &&
        //     privateGrades != "true"
        // )
        //     throw new AppError(
        //         "Invalid 'privateGrades' parameter",
        //         400,
        //         "INVALID_PARAM",
        //         "year"
        //     );

        const tokenData = await queryOne<ApiToken>(
            "SELECT cookieString FROM apiToken WHERE token = ?",
            [apiToken],
            db
        );

        if (!tokenData) {
            throw new AppError(
                "Invalid token or not found (internal server error)",
                401,
                "INVALID_API_TOKEN"
            );
        }

        const { cookiestring } = tokenData;
        const decryptedCookies = decrypt(cookiestring);

        const grades = await getGrades(decryptedCookies, apiToken);
        const filteredGrades = filterQuery(grades, req.query);
        if (!grades) {
            throw new AppError("Failed to retrieve grades from NSAC", 502, "UPSTREAM_ERROR");
        }
        const { warning, userCurrentYear } = grades;

        let data = {
            warning,
            userCurrentYear,
            filteredGrades,
        } as any;

        res.status(200).json(success(data));
    } catch (err: any) {
        next(err);
    }
}
