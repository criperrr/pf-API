import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../types/ApiError.js";
const secretKey: any = process.env.SECRETKEY;

if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export function checkJwtAuth(req: Request, res: Response, next: NextFunction) {


    const jwtToken = req.headers.authorization!.split(" ")[1];

    if (!jwtToken)
        throw new AppError("No token provived", 401, "AUTH_MISSING_TOKEN");

    jwt.verify(jwtToken, secretKey, function (err: Error | null) {
        if (err) {
            console.log(err);

            if (err.name == "JsonWebTokenError") {
                throw new AppError(
                    "Invalid JWT token",
                    403,
                    "AUTH_INVALID_TOKEN"
                );
            }
        }

        next();
    });
}
