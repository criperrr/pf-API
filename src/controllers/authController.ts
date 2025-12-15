import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { newUser, Users } from "../models/index.js";

import db, { queryOne, runSql } from "../utils/database.js";
import verifyEmptyFields from "../utils/emptyFields.js";
import { success } from "../utils/responseHelpers.js";
import { generateRandomString } from "../utils/crypto.js";

import { AppError } from "../types/ApiError.js";
import {
    ApiResponse,
    RegisterAuthRequest,
    LoginResponse,
    RegisterResponse,
    JwtTokenPayload,
} from "../types/index.js";

const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export async function register(
    req: Request<{}, ApiResponse<RegisterResponse>, RegisterAuthRequest>,
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
        if (emailExists && emailExists.id_user) {
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

        const data: RegisterResponse = {
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
        const { id_user, passwordhash }: Users = (await queryOne<Users>(
            "SELECT id_User, passwordHash FROM Users WHERE email = ?",
            [email],
            db
        )) ?? { id_user: null, passwordhash: null };
        const passMatch = id_user ? await bcrypt.compare(password, passwordhash) : false;

        if (!id_user || !passMatch) {
            throw new AppError("Invalid email or password", 401, "AUTH_INVALID_CREDENTIALS");
        }

        const jwtToken = jwt.sign(
            {
                id_user,
                email,
            },
            secretKey,
            {
                expiresIn: "3h",
                issuer: "Vitinho", // desculpa vitinho :)
            }
        );
        console.log("Users with email " + email + " logged in.");

        const successData: LoginResponse = {
            message: "Logged succesfully",
            userId: id_user,
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

        if (!payload || !payload.id_user) {
            throw new AppError("Invalid JWT token", 401, "AUTH_MISSING_PAYLOAD");
        }

        const userId = payload.id_user;
        verifyEmptyFields({ userId });

        let { mastertoken } = (await queryOne<Users>(
            "SELECT masterToken FROM Users WHERE id_User = ?",
            [userId],
            db
        )) ?? {
            masterToken: null,
        };

        if (mastertoken !== null) {
            return res.status(200).json(
                success({
                    message: "Already have a token, returning it",
                    masterToken: mastertoken,
                })
            );
        }

        mastertoken = generateRandomString(30);
        const lastID = await runSql(
            "UPDATE Users SET masterToken = ? WHERE id_User = ?",
            [mastertoken, userId],
            db
        );

        if (!lastID) throw new Error("Failed to update database while creating masterToken.");
        return res.status(200).json(
            success({
                message: "Token created successfully",
                masterToken: mastertoken,
            })
        );
    } catch (err: any) {
        next(err);
    }
}
