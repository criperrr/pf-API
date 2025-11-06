import { Request, Response } from "express";

export async function testeBrincando(req: Request, res: Response) {
    const string = `Olá ao mundo que eu nunca vi e nunca verei!\n`
    console.log(req);
    console.log(req.headers);
    console.log("oi munduuuu!!!!");
    return res.status(200).json({ message: string });
}