import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { singleError } from "../utils/responseHelpers.js";
const secretKey: any = process.env.SECRETKEY;

if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export function checkJwtAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.body) {
        return res.status(400).json(singleError("Missing request body", "MISSING_REQUEST_BODY"));
    }
    const jwtToken = req.headers.authorization?.split(" ")[1];

    if (!jwtToken) return res.status(401).json({ error: "No token provided." });

    jwt.verify(jwtToken, secretKey, function (err: Error | null, _: any) {
        if (err) {
            console.log(err.name);

            if (err.name == "JsonWebTokenError") {
                res.status(403).json({ error: "Invalid Token" });
            }
        }

        next("route");
    });
}
