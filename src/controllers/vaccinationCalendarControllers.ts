import { Request, Response } from "express";
import { prisma } from "../prismaClient/prismaClient";
import { v4 as uuidv4, validate } from "uuid";
import { parseISO, isValid } from "date-fns";

export const createCalendar = async (req: Request, res: Response) => {
    try {
        const { local, date, places, status, observation, responsible, vaccine } = req.body;

        //Validações iniciais
        if (!local) {
            return res.status(400).json({ error: "The local is mandatory" });
        }
        if (!date) {
            return res.status(400).json({ error: "The date is mandatory" });
        }
        if (!isValid(parseISO(date))) {
            return res.status(400).json({ error: "Incorrect date entered" });
        }
        if (!places) {
            return res.status(400).json({ error: "The places is mandatory" });
        }
        if (!responsible) {
            return res.status(400).json({ error: "The responsible is mandatory" });
        }
        if (!vaccine) {
            return res.status(400).json({ error: "The vaccine is mandatory" });
        }

        //Validando que a vacina passada de fato existe
        const searchVaccine = await prisma.vaccine.findUnique({
            where: {
                name: vaccine,
            }
        });
        if (!searchVaccine) {
            return res.status(400).json({ error: "Vaccine not found" });
        }

        // Verificar se há algum evento de calendário marcado para o mesmo local no mesmo dia
        const existingEvent = await prisma.vaccinationCalendar.findFirst({
            where: {
                local: local,
                date: date,
            },
        });

        // Caso já exista um evento com essas credenciais
        if (existingEvent) {
            return res.status(400).json({ message: "Event with venue and date already registered" });
        }

        //Criando objeto o evento
        const createEventInCalendar = await prisma.vaccinationCalendar.create({
            data: {
                id: uuidv4(),
                local: local,
                date: date,
                places: places,
                responsible: responsible,
                status: "Status not informed" || status,
                observation: "Observation not informed" || observation,
                idVaccine: searchVaccine.id, 
            }
        });

        //Retornando resultado
        res.status(200).json({ message: "Registered event", createEventInCalendar});
    } catch (error) {
        //Caso haja erro:
        console.error("Error retrieving calendar: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const findAllCalendars = async (req: Request, res:Response) => {
    try {
        const calendars = await prisma.vaccinationCalendar.findMany();
        return res.status(200).json(calendars);
    } catch (error) {
        //Caso haja erro:
        console.error("Error retrieving calendar: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const findSpecificCalendar = async (req: Request, res: Response) =>{
    try {
        const calendarId = req.params.id;

        //Verificando se o id passado é válido
        if (!validate(calendarId)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        //Valiando a existência do evento no calendário de vacinação
        const existEventCalendar = await prisma.vaccinationCalendar.findUnique({
            where:{
                id: calendarId,
            },
            select:{
                //Campos que serão retornados na requisição
                local: true,
                date: true,
                places: true,
                responsible: true,
                observation: true,
                status: true,
                idVaccine: true
            }
        });

        if (!existEventCalendar) {
            return res.status(400).json({ error: "Event not found" });
        }
        res.status(200).json(existEventCalendar);
    } catch (error) {
        //Caso haja erro:
        console.error("Error retrieving calendar: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateEventCalendar = async (req: Request, res:Response) => {
    try {
        const eventId = req.params.id;
        const { local, date, places, status, observation, responsible, vaccine } = req.body;

        //Verificando se o id passado é válido
        if (!validate(eventId)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        //Verificando se existe o evento com o id informado
        const existEventInCalendar = await prisma.vaccinationCalendar.findUnique({
            where:{
                id: eventId
            }
        }); 
        if (!existEventInCalendar) {
            return res.status(400).json({ error: "Event not found" });
        }

        //Validações iniciais
        if (!local) {
            return res.status(400).json({ error: "The local is mandatory" });
        }
        if (!date) {
            return res.status(400).json({ error: "The date is mandatory" });
        }
        if (!isValid(parseISO(date))) {
            return res.status(400).json({ error: "Incorrect date entered" });
        }
        if (!places) {
            return res.status(400).json({ error: "The places is mandatory" });
        }
        if (!responsible) {
            return res.status(400).json({ error: "The responsible is mandatory" });
        }
        if (!vaccine) {
            return res.status(400).json({ error: "The vaccine is mandatory" });
        }

        //Validando a existencia da vacina
        const searchVaccine = await prisma.vaccine.findUnique({
            where: {
                name: vaccine,
            }
        });
        if (!searchVaccine) {
            return res.status(400).json({ error: "Vaccine not found" });
        }

        // Verificar se há algum evento de calendário marcado para o mesmo local no mesmo dia
        const existingEvent = await prisma.vaccinationCalendar.findFirst({
            where: {
                local: local,
                date: date,
                id: { not: eventId} //Se há algum evento cadastrado para esse dia e local porém desconsiderando o evento atualizado
            },
        });

        // Caso já exista um evento com essas credenciais
        if (existingEvent) {
            return res.status(400).json({ message: "Event with venue and date already registered" });
        }

        //Criando objeto de atualização
        const updateEvent = await prisma.vaccinationCalendar.update({
            where:{
                id: eventId,
            },
            data:{
                local: local,
                date: date,
                places: places,
                responsible: responsible,
                observation: observation,
                status: status,
                idVaccine: searchVaccine.id,
            }
        });
        res.status(200).json({ message: "Update event", updateEvent});
    } catch (error) {
        //Caso haja erro:
        console.error("Error retrieving calendar: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const removeEvent = async (req: Request, res: Response) =>{
    try {
        const eventId = req.params.id;

        //Verificando se o id passado é válido
        if (!validate(eventId)) {
            return res.status(400).json({ error: "Invalid id" });
        }

        //Verificando se existe o evento com o id informado
        const existEventInCalendar = await prisma.vaccinationCalendar.findUnique({
            where:{
                id: eventId
            }
        }); 
        if (!existEventInCalendar) {
            return res.status(400).json({ error: "Event not found" });
        }
        await prisma.vaccinationCalendar.delete({
            where:{
                id: eventId,
            },
        });

        res.status(200).json({ message: "Event removed" });
    } catch (error) {
        //Caso haja erro:
        console.error("Error retrieving calendar: ", error);
        return res.status(500).json({ error: "Internal Server Error" });        
    }
};