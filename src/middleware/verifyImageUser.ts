import { Request, Response, NextFunction } from "express";
import { prisma } from "../prismaClient/prismaClient";
import { existsSync, unlinkSync } from "fs";
import path from "path";

export async function verifyImageUser(req: Request, res: Response, next: NextFunction) {
    const userId = req.params.id;

    try {
        const existUser = await prisma.user.findUnique({
            where:{
                id: userId,
            }
        });//Verificando a veracidade do usuário
    
        if (existUser?.image && existUser.image !== 'Image not registered' && existUser.image !== null) {
            //Caminho do arquivo de foto do usuário
            const oldImagePath = path.join(__dirname, ".." , "..", "/uploads", existUser.image);
            
            //Só remove se existir
            if (existsSync(oldImagePath)) {
                unlinkSync(oldImagePath); //Remove arquivo do diretório
            }
        }
        next();
        
    } catch (error) {
        console.error('Error checking user and deleting old image:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}