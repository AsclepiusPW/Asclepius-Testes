import express from "express";
const reservationRoutes = express.Router();


//Importando as funções de vaccination
import { requestReservation, listReservations, removeReservation, updateReservation } from "../controllers/reservationControllers";
import { verifyToken } from "../middleware/verifyToken";

//Rotas
reservationRoutes.get("/", verifyToken, listReservations);
reservationRoutes.post("/", verifyToken, requestReservation);
reservationRoutes.delete("/remove/:id", verifyToken, removeReservation);
reservationRoutes.put("/update/:id", verifyToken, updateReservation);

export { reservationRoutes };