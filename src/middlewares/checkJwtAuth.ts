import { configDotenv } from "dotenv";
import jwt from 'jsonwebtoken'
configDotenv();
const secretKey: any = process.env.SECRETKEY;
if (!secretKey) {
    console.error("FATAL ERROR: SECRETKEY is not defined in .env");
    process.exit(1);
}

export function checkJwtAuth(jwtToken: string) {
    jwt.verify(jwtToken, secretKey)
}
