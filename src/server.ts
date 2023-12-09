//Importando o app do arquivo 'app.ts'
import app from "./app";

//Porta padrão da aplicação
const port = process.env.API_PORT || 5000;

//Inicializando a API
app.listen(port, () => {
  console.log(`Server is running in port ${port}`);
});
