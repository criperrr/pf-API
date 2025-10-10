/**
 * @typedef {import("express").Request} Request Importa o objeto de request e response do express pro vscode entender o tipo pq ele é burro mentira pq o js n é tipado mesmo
 * @typedef {import("express").Response} Response
 */

/**
 * @param {Request} req objeto de requisição do express
 * @param {Response} res objeto de resposta
 */
export const testeBrincando = async (req, res) => {
    const string = `Olá ao mundo que eu nunca vi e nunca verei!\n`
    console.log(req);
    console.log(req.headers);
    console.log("oi munduuuu!!!!")
    return res.status(200).json({ message: string });
}