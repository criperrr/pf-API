import crypto from "crypto";
const cryptoAlgorithm = "aes-256-cbc";
import "dotenv/config";

const secret = process.env.ENCRYPTIONKEY as string;
if (!secret) throw new Error("No key defined.");
const key = Buffer.from(secret, "hex");

export function encrypt(message: string): string {
    const iv = Buffer.from(crypto.randomBytes(16));

    const cipher = crypto.createCipheriv(cryptoAlgorithm, key, iv);
    const crypted = cipher.update(message) + cipher.final("hex");

    return `${crypted}:${iv.toString("hex")}`;
}

export function decrypt(message: string): string {
    const [crypted, ivHex] = message.split(":");

    if (!crypted || !ivHex) throw new Error("Invalid data");

    const iv = Buffer.from(ivHex, "hex");

    const decipher = crypto.createDecipheriv(cryptoAlgorithm, key, iv);

    const decrypted =
        decipher.update(crypted, "hex", "utf8") + decipher.final("utf8");

    return decrypted;
}

export function generateRandomString(length: number) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}
console.log();
