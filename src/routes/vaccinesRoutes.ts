import express from "express";
const vaccinesRoutes = express.Router();

//Conjunto de requisições do usuário:
import { findAllVaccines, createVaccines, editVaccine, removeVaccine, findVaccineById} from "../controllers/vaccinesController";

//Rotas
vaccinesRoutes.get("/", findAllVaccines);
vaccinesRoutes.post("/", createVaccines);
vaccinesRoutes.get("/:id", findVaccineById);
vaccinesRoutes.patch("/update/:id", editVaccine);
vaccinesRoutes.delete("/remove/:id", removeVaccine);

export { vaccinesRoutes };
