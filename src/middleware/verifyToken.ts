import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload{
    sub: string,
    exp: number,
    name: string
}

export async function verifyToken(req:Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        return res.status(400).json({message: "Restricted access"});
    }

    try {
        const secret = process.env.SECRET;
        if(!secret){
            throw new Error('JWT secret is not defined');
        }

        let {name, sub} = verify(token, secret) as IPayload;
        req.id_User = sub;

    } catch (error) {
        console.error(error);
        res.status(500).json({error: "Internal Server Error"});
    }
    next();
}