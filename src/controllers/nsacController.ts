import { Request, Response } from "express";
import { login } from "../utils/loginNsac.js";
import verifyEmptyFields from "../utils/emptyFields.js";
import { encrypt, generateRandomString } from "../utils/crypto.js";
import db, { ensureDbCreated, runSql } from "../utils/database.js";

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

export async function createToken(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }
    let response: ApiResponse = {
        errors: [],
        data: {},
    };

    const { email, password, userId } = req.body as nsacAccountRequest;
    console.log({
        email,
        // password,
        userId,
    });

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
        console.log(loginNsac);

        if (!loginNsac) {
            response = {
                errors: [
                    {
                        error: "Invalid NSAC email or password",
                    },
                ],
            };
            return res.status(401).json(response);
        }

        const encryptedPassword = encrypt(password);
        const encryptedCookie = encrypt(loginNsac);
        const apiToken = generateRandomString(20);
        console.log({
            encryptedPassword,
            encryptedCookie,
            apiToken
        });

        await ensureDbCreated();
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
    } catch (err) {
        response.errors = [
            {
                error: "Internal server error",
            },
        ];
        console.log(err)
        return res.status(500).json(response);
    }
}

export async function getTokens(req: Request, res: Response) {}

export async function deleteTokens(req: Request, res: Response) {}

export async function getClassGrades(req: Request, res: Response) {}

export async function getPrivateGrades(req: Request, res: Response) {}

export async function getAllGrades(req: Request, res: Response) {}
