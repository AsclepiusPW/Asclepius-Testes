import { Request, Response } from "express";
import { prisma } from "../prismaClient/prismaClient";
import { v4 as uuidv4, validate } from "uuid";
import { parseISO, isValid, isSameDay } from "date-fns";

//Relação entre usuário e vacina
//Método para criar um registro de vacinação
export const registerVaccination = async (req: Request, res: Response) => {
    try {
        //Pegando o id do usuário através do token passado pela a requisição
        const userId = req.id_User;
        //Pegando as credenciais do registro de vacinação
        const { date, applied, vaccine } = req.body;

        //Validando a existência do usuário e anexando a propriedade Vaccination
        const searchUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                vaccination: true,
            }
        });
        if (!searchUser) {
            return res.status(400).json({ error: "User not found" });
        }

        //Validação da vacina
        if (!vaccine) {
            return res.status(400).json({ error: "The vaccine is mandatory" });
        }
        const searchVaccine = await prisma.vaccine.findUnique({
            where: {
                name: vaccine,
            }
        });
        if (!searchVaccine) {
            return res.status(400).json({ error: "Vaccine not found" });
        }

        //Validação de date
        if (!date) {
            return res.status(400).json({ error: "The date is mandatory" });
        }
        if (!isValid(parseISO(date))) {
            return res.status(400).json({ error: "Incorrect date entered" });
        }

        //Validando que não existe registro cadastrado com data e a mesma vacina
        const verifyVaccineId = await prisma.vaccination.count({
            where: {
                idUser: userId,
                idVaccine: vaccine.id,
            },
        });

        const verifyVaccineDate = await searchUser.vaccination.some((resgiter) => isSameDay(new Date(resgiter.date), parseISO(date)));
        if (verifyVaccineId >= 1 && verifyVaccineDate) { //Validação dupla
            return res.status(400).json({ message: "Vaccination registration already done" });
        }

        //Criando objeto
        const newRegisterVaccination = await prisma.vaccination.create({
            data: {
                id: uuidv4(),
                date: date,
                quantityApplied: 1 || applied,
                idVaccine: searchVaccine.id,
                idUser: userId
            }
        });

        //Retornando resultado
        res.status(200).json({ message: "Registered vaccination", newRegisterVaccination });

    } catch (error) {
        //Retornando erro caso haja
        console.error("Error retrieving vaccination: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//Método para imprimir todas os resistros de vacinação do usuário
export const listVaccination = async (req: Request, res: Response) => {
    try {
        //Capturando o id do usuário atraves do token passado pela requisição
        const userId = req.id_User;

        //Validando a existência do usuário e anexando a propriedade Vaccination
        const searchUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                vaccination: true,
            }
        });
        if (!searchUser) {
            return res.status(400).json({ error: "User not found" });
        }

        res.status(200).json(searchUser.vaccination);
    } catch (error) {
        //Retornando erro caso haja
        console.error("Error retrieving vaccination: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//Método para remover um registro 
export const removeVaccination = async (req: Request, res: Response) => {
    try {
        //Pegando o id do usuário através do token passado pela a requisição
        const userId = req.id_User;

        //Pegando o id do registro de vacinação
        const vaccinationId = req.params.id;

        //Verificando se o id passado é válido
        if (!validate(vaccinationId)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        //Validando a existência do usuário e anexando a propriedade Vaccination
        const searchUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                vaccination: true,
            }
        });
        if (!searchUser) {
            return res.status(400).json({ error: "User not found" });
        }

        //Validação de registro de vacinação
        const searchVaccination = await prisma.vaccination.findUnique({
            where: {
                id: vaccinationId
            }
        });
        if (!searchVaccination) {
            return res.status(400).json({ error: "Vaccination not found" });
        }

        //Removendo o registro de vacinção da entidade Vaccination
        await prisma.vaccination.delete({
            where: {
                id: vaccinationId,
            }
        });

        //Atualizando a remoção do usuário
        const updateRemoveUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                vaccination: {
                    disconnect: [{ id: vaccinationId }]
                }
            },
            include: {
                vaccination: true,
            }
        });

        res.status(200).json(updateRemoveUser);
    } catch (error) {
        //Retornando erro caso haja
        console.error("Error retrieving vaccination: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//Método de atualização de um registro de vacinação
export const updateVaccination = async (req: Request, res: Response) => {
    try {
        const userId = req.id_User;
        const vaccinationId = req.params.id;
        const { date, applied, vaccine } = req.body;

        //Validando a existência do usuário e anexando a propriedade Vaccination
        const searchUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                vaccination: true,
            }
        });
        if (!searchUser) {
            return res.status(400).json({ error: "User not found" });
        }

        //Validação da vacina
        if (!vaccine) {
            return res.status(400).json({ error: "The vaccine is mandatory" });
        }
        const searchVaccine = await prisma.vaccine.findUnique({
            where: {
                name: vaccine,
            }
        });
        if (!searchVaccine) {
            return res.status(400).json({ error: "Vaccine not found" });
        }

        //Validação de date
        if (!date || !isValid(parseISO(date))) {
            return res.status(400).json({ error: "Incorrect date entered" });
        }

        //Verificando se o id passado é válido
        if (!validate(vaccinationId)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        //Validação de registro de vacinação
        const searchVaccination = await prisma.vaccination.findUnique({
            where: {
                id: vaccinationId
            }
        });
        if (!searchVaccination) {
            return res.status(400).json({ error: "Vaccination not found" });
        }
       
        //Validar que não existe informação repedida
        const isDuplicate = await prisma.vaccination.count({
            where: {
                idUser: userId,
                idVaccine: vaccine.id,
                date: parseISO(date),
                id: { not: vaccinationId }, //Procura registros que possuam essas credenciais, porém desconsidera a versão atualizada
            },
        });
        if (isDuplicate > 0) {
            return res.status(400).json({ message: "Vaccination registration already done" });
        }

        // Atualizar o registro de vacinação
        await prisma.vaccination.update({
            where: { id: vaccinationId },
            data: {
                date: parseISO(date),
                quantityApplied: applied,
                idVaccine: searchVaccine.id,
            },
        });

        // Atualizar o array de vaccinação dentro do usuário
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                vaccination: {
                    update: [
                        {
                            where: { id: vaccinationId },
                            data: {
                                date: parseISO(date),
                                quantityApplied: applied,
                                idVaccine: searchVaccine.id,
                            },
                        },
                    ],
                },
            },
            include: { vaccination: true },
        });

        res.status(200).json({ message: "Up-to-date vaccination record", updatedUser });
    } catch (error) {
        //Retornando erro caso haja
        console.error("Error retrieving vaccination: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
