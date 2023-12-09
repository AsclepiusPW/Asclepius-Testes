import express from "express";
import path from "path";
import { userRoutes } from "./routes/userRoutes";
import { vaccinesRoutes } from "./routes/vaccinesRoutes";
import { eventRoutes } from "./routes/vaccineCalendarRoutes";
import { vaccinationRoutes } from "./routes/vaccination";
import { reservationRoutes } from "./routes/reservationRoutes";

//Configurações iniciais
const app = express();
app.use(express.json());

//Rotas de usuário
app.use("/user", userRoutes);

//Rotas de vacinas
app.use("/vaccine", vaccinesRoutes);

//Rotas de eventos do calendário de vacina
app.use("/event", eventRoutes);

//Rotas de registro de vacinação
app.use("/register", vaccinationRoutes);

//Rotas de solicitação de reserva
app.use("/reservation", reservationRoutes);

//Configurando rota para upload de arquivo
app.use("/images", express.static(path.join(__dirname, "..", "uploads")));

//Exportando o app configurado
export default app;
