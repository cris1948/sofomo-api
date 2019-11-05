import { Request, Response } from "express";

export interface PromisifiedRequestHandler {
    (req: Request, res: Response): Promise<void>;
}

export interface PassportExtendedRequest extends Request {
    user: User;
}

export interface User {
    id: number;
    email: string;
    password: string;
}
