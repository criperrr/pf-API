import { NsacAccount, User, ApiToken } from '../models/index.js';

import { sqlite3 } from 'sqlite3';


import { Request, Response } from 'express';


export const login = async (req: Request, res: Response) => {
    console.log(req.body);
}

