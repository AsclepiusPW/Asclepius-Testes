import express from 'express';
import multer from 'multer';
const userRoutes = express.Router();

//Conjunto de requisições do usuário:
import { findAllUsers, findSpecificUser, createUser, authenticateUser, removeUsers, editUser, uploadImage } from '../controllers/userControllers';
//Importando o middleware de verificação de token
import { verifyToken } from '../middleware/verifyToken'; 
//Importando o middleware do controle de upload de imagens
import { verifyImageUser } from '../middleware/verifyImageUser';
//Importando o arquivo de configuração do multer
import uploadConfigImage from '../config/multer';
const upload = multer(uploadConfigImage); 

//Rotas
userRoutes.get("/", findAllUsers);
userRoutes.post("/", createUser);
userRoutes.post("/authentication", authenticateUser);
userRoutes.put("/update/:id", verifyToken, editUser);
userRoutes.get("/:id", verifyToken, findSpecificUser);
userRoutes.delete("/remove/:id", verifyToken, removeUsers); //Quando deletar um usuário deve deletar a sua imagem  
userRoutes.patch("/upload/:id", verifyToken, verifyImageUser, upload.single("image"), uploadImage); //Método de criar e editar a foto do usuário

export { userRoutes };