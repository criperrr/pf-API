import { Request, Response } from "express";
import verifyEmptyFields from "../utils/emptyFields.js";
import { encrypt, generateRandomString } from "../utils/crypto.js";
import db, { getSql, runSql, queryOne } from "../utils/database.js";
import { ApiToken } from "../models/ApiToken.js";
import jwt from "jsonwebtoken";
const secretKey: any = process.env.SECRETKEY;
import { getGrades } from "../utils/getGrades.js";
import { decrypt } from "../utils/crypto.js";
// router.post("/accounts", checkJwtAuth, nsacController.createToken);
// router.get("/accounts", checkJwtAuth, nsacController.getTokens);
// router.delete("/accounts", checkJwtAuth, nsacController.deleteTokens);

// router.get("/grades/class", nsacController.getClassGrades);
// router.get("/grades/private", nsacController.getPrivateGrades);
// router.get("/grades", nsacController.getAllGrades);

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
        APIToken?: string;
    };
}

interface jwtTokenPayload {
    id_User: string;
    email: string;
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
        // const loginNsac = await login(email, password);

        // if (!loginNsac) {
        //     response = {
        //         errors: [
        //             {
        //                 error: "Invalid NSAC email or password",
        //             },
        //         ],
        //     };
        //     return res.status(401).json(response);
        // }

        const encryptedPassword = encrypt(password);
        const encryptedCookie = encrypt("loginNsac");
        const apiToken = generateRandomString(32).toUpperCase();

        const nsacAccountId = await runSql(
            "INSERT INTO NsacAccount(email, password) VALUES (?, ?)",
            [email, encryptedPassword],
            db
        );

        if (!nsacAccountId) throw new Error("Failed to insert NsacAccount");

        const apiTokenId = await runSql(
            "INSERT INTO ApiToken(id_User, id_NsacAccount, cookieString, token) VALUES (?, ?, ?, ?)",
            [
                userId.toString(),
                nsacAccountId.toString(),
                encryptedCookie,
                apiToken,
            ],
            db
        );

        if (!apiTokenId) throw new Error("Failed to insert ApiToken");

        response.data = {
            userId: userId,
            nsacAccountId: nsacAccountId,
            APIToken: apiToken,
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
            "SELECT token, id_NsacAccount FROM ApiToken WHERE id_User = ?",
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
            "DELETE FROM ApiToken WHERE token = ? ",
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
                    error: "Nothing was changed (wrong API Key?)"
                }
            ]
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
    const { APIToken, ano } = req.body;
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, ano, APIToken);
        if (!grades) throw new Error();

        response.data = {
            generalHashes: grades.generalHashes,
            ...grades.generalGrades,
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
    const { APIToken, ano } = req.body;
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, ano, APIToken);
        if (!grades) throw new Error();

        response.data = {
            userCurrentYear: grades.userCurrentYear,
            userHashes: grades.userHashes,
            ...grades.userGrades,
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
    const { APIToken, ano } = req.body;
    try {
        const { cookieString } = await queryOne<ApiToken>(
            "SELECT cookieString FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        const decryptedCookies = decrypt(cookieString);

        const grades = await getGrades(decryptedCookies, ano, APIToken);
        if (!grades) throw new Error();

        response.data = {
            ...grades,
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
