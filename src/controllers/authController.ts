import { NsacAccount, User, ApiToken, newUser } from '../models/index.js';

import db from '../utils/database.js';

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

interface ApiResponse {
    errors?: Array<Object>,
    data?: {
        message?: string
    }
};

function verifyEmptyFields(fields: Record<string, string>): Array<string> {
    console.log(fields);
    let emptyFields: Array<string> = [];
    for(const key in fields){
        if(!fields[`${key}`]){
            emptyFields.push(`${key}`);
        }
    }
    return emptyFields;
}

export const register = async (req: Request, res: Response) => {
    console.log('request!')
    let response: ApiResponse = {
        errors: [],
        data: {}
    };
    const userInfo: newUser = req.body;
    const name = userInfo.name;
    const email = userInfo.email;
    const password = userInfo.password;
    console.log({
        userInfo,
        name,
        email,
        password
    })
    let errors: Array<Object> = verifyEmptyFields({name, email, password});
    console.log(errors);
    if(errors.length != 0) {
        console.log('invalid body!');
        for(const error of errors){
            response.errors?.push({
                "field": `${error}`,
                "error": `Empty field ${error}`
            });
        }
        res.status(400).json(response);
        return;
    }
    const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;

    if(emailRegex.test(email)){
        const passHash = await bcrypt.hash(password, 10);

        const stmt = db.prepare('INSERT INTO User(name, email, passwordHash) VALUES (?, ?, ?)');

        stmt.run([name, email, passHash], function (err) {
            if(err){
                response.errors = [{
                    "error": "Internal error, report it to a dev, please.",
                }];
                res.status(500).json(response);
                return;

            };

        })
        response.data = {
            "message": "Sucess! You can now login using /login route and get your JWT token. "
        }
        res.status(201).json(response);
        return;
    } else {
        response.errors = [{
            "field": "email",
            "error": "Invalid email"
        }]
        res.status(400).json(response);
        return;
    }
}

