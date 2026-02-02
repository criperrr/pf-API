import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../types/ApiError.js";
import db, { queryOne } from "../utils/database.js";

const secretKey: any = process.env.SECRETKEY;

if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export async function checkAuth(req: Request, _: Response, next: NextFunction) {
    
    const jwtToken = req.headers.authorization?.split(" ")[1];
    const masterToken = req.headers["x-master-token"] as string;
    console.log({jwtToken, masterToken})

    if (!jwtToken && !masterToken)
        throw new AppError(
            "No x-master-token OR JWTtoken provived",
            401,
            "AUTH_MISSING_CREDENTIALS"
        );

    if (jwtToken) {
        jwt.verify(jwtToken, secretKey, function (err: Error | null) {
            if (err) {
                console.log(err);

                if (err.name == "JsonWebTokenError") {
                    throw new AppError("Invalid JWT token", 403, "AUTH_INVALID_TOKEN");
                }
            }

            next();
        });
    }
    if (masterToken) {
        const user = await queryOne("SELECT 1 FROM Users WHERE masterToken = ?", [masterToken], db);
        if (!user) throw new AppError("Invalid masterToken", 403, "AUTH_INVALID_TOKEN");
        next();
    }
}
