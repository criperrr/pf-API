import { NsacAccount, User, ApiToken, newUser } from '../models/index.js';

import sqlite3 from 'sqlite3';
import db from '../utils/database.js';

import { Request, Response } from 'express';


export const register = async (req: Request, res: Response) => {
    const userInfo: newUser = req.body;
    const name = userInfo.name;
    const email = userInfo.email;
    const password = userInfo.password;
    const emailRegex = /[^\s@]+@+[^\s@]+\.+[^\s@]/;
    if(emailRegex.test(email)){
        const stmt = db.prepare('INSERT INTO User(name, email, password) VALUES (?, ?, ?)')
    }
}

