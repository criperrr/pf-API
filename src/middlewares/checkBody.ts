import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/ApiError.js";

export async function checkBody(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.body) {
            throw new AppError("Missing request body", 400, "MISSING_REQUEST_BODY");
        }
        next();
    } catch (err: any) {
        next(err);
    }
}
