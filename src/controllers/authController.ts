import { newUser, User } from '../models/index.js';
import db from '../utils/database.js';
import { runSql, getSql } from '../utils/database.js';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

interface ApiResponse {
    errors?: Array<Object>,
    data?: {
        message?: string,
        userId?: number 
    }
};

function verifyEmptyFields(fields: Record<string, string>): Array<string> {
    let emptyFields: Array<string> = [];
    for(const key in fields){
        if(!fields[`${key}`]){
            emptyFields.push(`${key}`);
        }
    }
    return emptyFields;
}

export async function register (req: Request, res: Response) {
    let response: ApiResponse = {
        errors: [],
        data: {}
    };

    const { name, email, password }: newUser = req.body;

    const emptyFields = verifyEmptyFields({ name, email, password });
    if(emptyFields.length != 0) {
        response.errors = emptyFields.map(field => ({
            "field": field,
            "error": `Empty field ${field}`
        }));
        return res.status(400).json(response);
    }

    const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;
    if(!emailRegex.test(email)){
        response.errors = [{
            "field": "email",
            "error": "Invalid email"
        }];
        return res.status(400).json(response);
    }

    try {
        const emailExists: User = await getSql(
            'SELECT id_User FROM User WHERE email = ?',
            [email],
            db
        )
        if(emailExists && emailExists.id_User){
            throw new Error("User.email: UNIQUE constraint failed");
        }
        
        const passHash = await bcrypt.hash(password, 8);

        const lastID = await runSql(
            'INSERT INTO User(name, email, passwordHash) VALUES (?, ?, ?)',
            [name, email, passHash],
            db
        )

        response.data = {
            "message": "User created successfully!",
            "userId": lastID
        };

        return res.status(201).json(response);

    } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
            response.errors = [{
                "field": "email",
                "error": "This email is already registered."
            }];
            return res.status(409).json(response);
        }

        console.error('Error during registration:', err);
        response.errors = [{
            "error": "Internal server error. Please report it to a dev.",
        }];
        return res.status(500).json(response);
    }
}

export async function login (req: Request, res: Response) {

}
