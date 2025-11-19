import { Request, Response, NextFunction } from "express";
import db, { runSql } from "../utils/database.js";

export async function checkApiKeyAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { APIToken } = req.body;

    try {
        const apiTokenId = await runSql(
            "SELECT * FROM ApiToken WHERE token = ?",
            [APIToken],
            db
        );
        console.log(apiTokenId);
        if (apiTokenId > 0) {
            next("route");
        } else {
            return res.status(401).json({ error: "Invalid API Token." });
        }
    } catch (err: any) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
