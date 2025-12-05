import { Request, Response, NextFunction } from "express";
import db, { runSql } from "../utils/database.js";
import { AppError } from "../types/ApiError.js";

export async function checkApiKeyAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const APIToken = req.headers["x-api-token"] as string;

    if (!APIToken)
        throw new AppError("No token provived", 401, "AUTH_MISSING_TOKEN");

    try {
        const apiTokenId = await runSql(
            "SELECT * FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        if (apiTokenId > 0) {
            next();
        } else {
            throw new AppError("Invalid API token", 403, "AUTH_INVALID_TOKEN");
        }
    } catch (err) {
        next(err);
    }
}
