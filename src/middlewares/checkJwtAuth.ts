import { configDotenv } from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
configDotenv();
const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export function checkJwtAuth(req: Request, res: Response, next: NextFunction) {
    const jwtToken = req.headers.authorization?.split(" ")[1];
    console.log(jwtToken);

    if (!jwtToken) return res.status(401).json({ error: "No token provided." });

    jwt.verify(
        jwtToken,
        secretKey,
        function (err: Error | null, dec: string | jwt.JwtPayload | undefined) {
            if (err) {
                console.log(err.name);

                if (err.name == "JsonWebTokenError") {
                    res.status(403).json({ error: "Invalid Token" });
                }
            }

            next("route");
        }
    );
}
