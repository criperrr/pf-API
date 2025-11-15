import { newUser, User } from "../models/index.js";
import db from "../utils/database.js";
import { runSql, getSql } from "../utils/database.js";
import { Request, Response } from "express";
import { configDotenv } from "dotenv";
configDotenv();
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1); 
}

interface ApiResponse {
    errors?: Array<Object>;
    data?: {
        message?: string;
        userId?: number;
    };
}

function verifyEmptyFields(fields: Record<string, string>): Array<string> {
    let emptyFields: Array<string> = [];
    for (const key in fields) {
        if (!fields[`${key}`]) {
            emptyFields.push(`${key}`);
        }
    }
    return emptyFields;
}

export async function register(req: Request, res: Response) {
    let response: ApiResponse = {
        errors: [],
        data: {},
    };

    const { name, email, password }: newUser = req.body;

    const emptyFields = verifyEmptyFields({ name, email, password });
    if (emptyFields.length != 0) {
        response.errors = emptyFields.map((field) => ({
            field: field,
            error: `Empty field ${field}`,
        }));
        return res.status(400).json(response);
    }

    const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;
    if (!emailRegex.test(email)) {
        response.errors = [
            {
                field: "email",
                error: "Invalid email",
            },
        ];
        return res.status(400).json(response);
    }

    try {
        const emailExists: User = await getSql<User>(
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

        response.data = {
            message: "User created successfully!",
            userId: lastID,
        };

        return res.status(201).json(response);
    } catch (err: any) {
        if (err.message.includes("UNIQUE constraint failed")) {
            response.errors = [
                {
                    field: "email",
                    error: "This email is already registered.",
                },
            ];
            return res.status(409).json(response);
        }

        console.error("Error during registration:", err);
        response.errors = [
            {
                error: "Internal server error. Please report it to a dev.",
            },
        ];
        return res.status(500).json(response);
    }
}

export async function login(req: Request, res: Response) {
    // To do; I need to learn CORS and then JWT.
    const { email, password }: User = req.body;
    let response: ApiResponse = {
        errors: [],
        data: {},
    };
    const emptyFields = verifyEmptyFields({ email, password });

    if (emptyFields.length != 0) {
        response.errors = emptyFields.map((field) => ({
            field: field,
            error: `Empty field ${field}`,
        }));
        return res.status(400).json(response);
    }
    try {
        const { id_User, passwordHash }: User = await getSql<User>(
            "SELECT id_User, passwordHash FROM User WHERE email = ?",
            [email],
            db
        );

        const passMatch = id_User
            ? await bcrypt.compare(password, passwordHash)
            : false;

        if (!id_User || !passMatch) {
            response.errors = [
                {
                    error: "Invalid email or password.",
                },
            ];
            console.log({ id_User, password, ...req.body });
            return res.status(401).json(response);
        }

        const jwtToken = jwt.sign(
            {
                id_User,
                email,
            },
            secretKey,
            {
                expiresIn: "24h",
            }
        );
        console.log(jwtToken);
        return res
            .cookie("token", jwtToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60,
            })
            .status(200)
            .json({
                message: "Logged succesfully",
                userId: id_User,
            });
    } catch (err) {
        console.log('internal error during login', err);
        response.errors = [
            {
                error: "Internal error"
            }
        ]
        return res.status(500).json(response);
    }
}
