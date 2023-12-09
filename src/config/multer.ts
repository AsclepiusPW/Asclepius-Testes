import multer, { Options } from "multer";
import crypto from "crypto"
import path from "path";

//Arquivo de criptografia e padronixação do filename da imagem
const fileHash = crypto.randomBytes(15).toString("hex");

export default{
    //Definindo o destino e o nome do arquivo
    storage: multer.diskStorage({
        destination: path.join(__dirname, "..", "..", "uploads"),
        filename: (req, file, callback) => {
            const filename = `${fileHash}-${file.originalname}`;

            return callback(null, filename);
        },
    }),
    //Definindo o limite do arquivo (Validação a mais)
    limits:{
        fileSize: 8 * 1024 * 1024, //8MB
    },
    //Defininfo o tipo de arquivo aceitável (Validação a mais)
    fileFilter: (req, file, callback) => {
        const mineType = ["image/png", "image/jpeg", "image/gif", "image/jpg"];

        if (!mineType.includes(file.mimetype)) {
            return callback(null, false);
        }

        return callback(null, true);
    },
} as Options