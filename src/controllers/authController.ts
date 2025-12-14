import { newUser, Users } from "../models/index.js";
import db, { queryOne, runSql } from "../utils/database.js";
import verifyEmptyFields from "../utils/emptyFields.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
    ApiResponse,
    LoginDataResponse,
    RegisterAuthRequest,
    RegisterDataResponse,
} from "../types/index.js";
import { success } from "../utils/responseHelpers.js";
import { AppError } from "../types/ApiError.js";
import { generateRandomString } from "../utils/crypto.js";

interface JwtTokenPayload {
    id_User: string;
    email: string;
}

const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export async function register(
    req: Request<{}, ApiResponse<RegisterDataResponse>, RegisterAuthRequest>,
    res: Response,
    next: NextFunction
) {
    const { name, email, password }: newUser = req.body;

    try {
        verifyEmptyFields({ name, email, password });

        const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;
        if (!emailRegex.test(email)) {
            throw new AppError("Invalid email", 400, "REG_INVALID_EMAIL_FORMAT", "email");
        }
        const emailExists: Users = await queryOne<Users>(
            "SELECT id_User FROM Users WHERE email = ?",
            [email],
            db
        );
        if (emailExists && emailExists.id_User) {
            throw new AppError(
                "This email is already registered.",
                409,
                "REG_DUPLICATED_EMAIL",
                "email"
            );
        }

        const passHash = await bcrypt.hash(password, 8);

        const lastID = await runSql(
            "INSERT INTO Users(name, email, passwordHash) VALUES (?, ?, ?) RETURNING id_User",
            [name, email, passHash],
            db
        );

        const data: RegisterDataResponse = {
            message: "Users created successfully!",
            userId: lastID,
        };
        return res.status(201).json(success(data));
    } catch (err: any) {
        console.error("Error during registration:", err);
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    const { email, password }: Users = req.body;

    try {
        verifyEmptyFields({ email, password });
        const { id_User, passwordHash }: Users = (await queryOne<Users>(
            "SELECT id_User, passwordHash FROM Users WHERE email = ?",
            [email],
            db
        )) ?? { id_User: null, passwordHash: null };
        const passMatch = id_User ? await bcrypt.compare(password, passwordHash) : false;

        if (!id_User || !passMatch) {
            throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS");
        }

        const jwtToken = jwt.sign(
            {
                id_User,
                email,
            },
            secretKey,
            {
                expiresIn: "3h",
                issuer: "Vitinho", // desculpa vitinho :)
            }
        );
        console.log("Users with email " + email + " logged in.");

        const successData: LoginDataResponse = {
            message: "Logged succesfully",
            userId: id_User,
        };

        return res
            .header("Authorization", `Bearer ${jwtToken}`)
            .status(200)
            .json(success(successData));
    } catch (err: any) {
        next(err);
    }
}

export async function createMasterToken(req: Request, res: Response, next: NextFunction) {
    // passes jwt middleware

    try {
        const jwtToken = req.headers.authorization!.split(" ")[1];

        if (!jwtToken) {
            throw new AppError("Invalid JWT token format.", 401, "AUTH_INVALID_PAYLOAD");
        }

        const payload = jwt.decode(jwtToken) as JwtTokenPayload;

        if (!payload || !payload.id_User) {
            throw new AppError("Invalid JWT token", 401, "AUTH_MISSING_PAYLOAD");
        }

        const userId = payload.id_User;
        verifyEmptyFields({ userId });

        let { masterToken } = (await queryOne<Users>(
            "SELECT masterToken FROM Users WHERE id_User = ?",
            [userId],
            db
        )) ?? {
            masterToken: null,
        };

        if (masterToken !== null) {
            return res.status(200).json(
                success({
                    message: "Already have a token, returning it",
                    masterToken: masterToken,
                })
            );
        }

        masterToken = generateRandomString(30);
        const lastID = await runSql(
            "UPDATE Users SET masterToken = ? WHERE id_User = ?",
            [masterToken, userId],
            db
        );

        if (!lastID) throw new Error("Failed to update database while creating masterToken.");
        return res.status(200).json(
            success({
                message: "Token created successfully",
                masterToken: masterToken,
            })
        );
    } catch (err: any) {
        next(err);
    }
}
