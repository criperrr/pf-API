import { Request, Response } from "express";
import { login } from "../utils/loginNsac.js";
import verifyEmptyFields from "../utils/emptyFields.js";
// router.post("/accounts", checkJwtAuth, nsacController.createToken);
// router.get("/accounts", checkJwtAuth, nsacController.getTokens);
// router.delete("/accounts", checkJwtAuth, nsacController.deleteTokens);

// router.get("/grades/class", nsacController.getClassGrades);
// router.get("/grades/private", nsacController.getPrivateGrades);
// router.get("/grades", nsacController.getAllGrades);
interface nsacAccountRequest {
    email: string;
    password: string;
}

interface ApiResponse {
    errors?: Array<Object>;
    data?: {
        message?: string;
        userId?: number;
    };
}

export async function createToken(req: Request, res: Response) {
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }
    let response: ApiResponse = {
        errors: [],
        data: {},
    };

    const { email, password } = req.body as nsacAccountRequest;

    const emptyFields = verifyEmptyFields({ email, password });
    if (emptyFields.length != 0) {
        response.errors = emptyFields.map((field) => ({
            field: field,
            error: `Empty field ${field}`,
        }));
        return res.status(400).json(response);
    }

    const loginNsac = await login(email, password);

    if(!loginNsac) {
        response = {
            errors: [
                {
                    error: "Invalid NSAC email or password"
                }
            ]
        }
        return res.status(401).json(response);
    }
    // const encryptedPassword = crypto
    // Now i need to learn crypt and AES-256-CBC crypto (and see other for fun)
}

export async function getTokens(req: Request, res: Response) {}

export async function deleteTokens(req: Request, res: Response) {}

export async function getClassGrades(req: Request, res: Response) {}

export async function getPrivateGrades(req: Request, res: Response) {}

export async function getAllGrades(req: Request, res: Response) {}
