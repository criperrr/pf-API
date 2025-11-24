import { newUser, User } from "../models/index.js";
import db, { queryOne, runSql } from "../utils/database.js";
import verifyEmptyFields from "../utils/emptyFields.js";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
    ApiResponse,
    LoginDataResponse,
    RegisterAuthRequest,
    RegisterDataResponse,
} from "../types/index.js";
import { failure, singleError, success } from "../utils/responseHelpers.js";

const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export async function register(
    req: Request<{}, ApiResponse<RegisterDataResponse>, RegisterAuthRequest>,
    res: Response
) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }

    const { name, email, password }: newUser = req.body;

    const emptyFields = verifyEmptyFields({ name, email, password });
    if (emptyFields.length != 0) {
        const errors = emptyFields.map((field) => ({
            field: field,
            message: `Empty field ${field}`,
            code: "REG_MISSING_FIELD",
        }));
        return res.status(400).json(failure(errors));
    }

    const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;
    if (!emailRegex.test(email)) {
        const error = [
            {
                field: "email",
                message: "Invalid email",
                code: "REG_INVALID_EMAIL_FORMAT",
            },
        ];
        return res.status(400).json(failure(error));
    }

    try {
        const emailExists: User = await queryOne<User>(
            "SELECT id_User FROM User WHERE email = ?",
            [email],
            db
        );
        if (emailExists && emailExists.id_User) {
            throw new Error("User.email: UNIQUE constraint failed");
        }

        const passHash = await bcrypt.hash(password, 8);

        const lastID = await runSql(
            "INSERT INTO User(name, email, passwordHash) VALUES (?, ?, ?)",
            [name, email, passHash],
            db
        );

        const data: RegisterDataResponse = {
            message: "User created successfully!",
            userId: lastID,
        };
        return res.status(201).json(success(data));
    } catch (err: any) {
        if (err.message.includes("UNIQUE constraint failed")) {
            return res
                .status(409)
                .json(
                    singleError(
                        "This email is already registered.",
                        "REG_DUPLICATED_EMAIL",
                        "email"
                    )
                );
        }

        console.error("Error during registration:", err);
        return res
            .status(500)
            .json(
                singleError(
                    "Internal server error. Please report it to a dev.",
                    "API_SERVER_ERRROR"
                )
            );
    }
}

export async function login(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }

    const { email, password }: User = req.body;

    const emptyFields = verifyEmptyFields({ email, password });

    if (emptyFields.length != 0) {
        const errors = emptyFields.map((field) => ({
            field: field,
            message: `Empty field ${field}`,
            code: "REG_MISSING_FIELD",
        }));
        return res.status(400).json(failure(errors));
    }
    try {
        const { id_User, passwordHash }: User =
            (await queryOne<User>(
                "SELECT id_User, passwordHash FROM User WHERE email = ?",
                [email],
                db
            )) ?? ({ id_User: null, passwordHash: null } as unknown as User);
        const passMatch = id_User
            ? await bcrypt.compare(password, passwordHash)
            : false;

        if (!id_User || !passMatch) {
            return res
                .status(401)
                .json(
                    singleError(
                        "Invalid email or password.",
                        "AUTH_INVALID_CREDENTIALS"
                    )
                );
        }

        const jwtToken = jwt.sign(
            {
                id_User,
                email,
            },
            secretKey,
            {
                expiresIn: "24h",
                issuer: "Vitinho", // desculpa vitinho :)
            }
        );
        console.log("User with email " + email + " logged in.");

        const successData: LoginDataResponse = {
            message: "Logged succesfully",
            userId: id_User,
        };

        return res
            .header("Authorization", `Bearer ${jwtToken}`)
            .status(200)
            .json(success(successData));
    } catch (err: any) {
        console.log("internal error during login", err);
        return res
            .status(500)
            .json(singleError("Internal server error", "API_SERVER_ERROR"));
    }
}
