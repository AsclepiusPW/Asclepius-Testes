import request from "supertest";
import app from "../../app";

describe("Integration testing of user controls", ()=> {
    //Variaveis de controle de usuário
    let idUser: string;
    let tokenUser: string;
    
    //Caso de teste 001
    it("Deve ser possível adicionar um novo usuário", async () => {
        const response = await request(app)
        .post("/user")
        .send({
            name: 'User test2',
            password: '123456',
            confirmPassword: '123456',
            email: 'test2@gmail.com',
            telefone: '(84) 909987646',
            latitude: -809.820,
            longitude: -991.29,
        });
        
        //Adicionando ID do usuário à variável de ambiente
        idUser = response.body.id;
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body.email).toBe("test2@gmail.com");
    }, 9999);
    
    //Caso de teste 002
    it("Deve ser possível autenticar um usuário", async () => {
        const response = await request(app)
        .post("/user/authentication")
        .send({
            name: 'User test2',
            password: '123456',
            confirmPassword: '123456',
            email: 'test2@gmail.com',
        });
        
        //Adicionando ID do usuário à variável de ambiente
        tokenUser = response.body.token;
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("token");
    }, 9999);
    
    //Caso de teste 003
    it("Deve ser possível retornar as informações do usuário", async () =>{
        const response = await request(app)
        .get(`/user/${idUser}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send()

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("email");
    });

    //Caso de teste 004
    it("Deve ser possível atualizar um usuário já cadastrado", async () =>{
        
        //Validando que de fato haja os elementos
        if (!idUser || !tokenUser) {
            console.log("Error ID e TOKEN não foram informados");
        }

        const response = await request(app)
        .put(`/user/update/${idUser}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send({
            name: 'User Update',
            password: '123456',
            confirmPassword: '123456',
            email: 'test@gmail.com',
            telefone: '(84) 909587646',
            latitude: -809.8280,
            longitude: -991.2469,
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Updated User");
        expect(response.body).toHaveProperty("updateUser");
        expect(response.body.updateUser.email).toBe("test@gmail.com");
        expect(response.body.updateUser.telefone).toBe("(84) 909587646");
    }, 9999);

    //Caso de teste 005
    it("Deve ser possível remover um usuário já cadastrado", async () => {

        //Validando que de fato haja os elementos
        if (!idUser || !tokenUser) {
            console.log("Error ID e TOKEN não foram informados");
        }

        const response = await request(app)
        .delete(`/user/remove/${idUser}`)
        .set('Authorization', `Bearer ${tokenUser}`)
        .send()

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: "User removed" });
    });
});