// Criando mock do prisma
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
};

//Importando os arquivos
import { Request, Response } from "express";
import {
  createUser,
  removeUsers,
  editUser,
  uploadImage,
  findSpecificUser,
} from "../../controllers/userControllers";

// Mock do multer
const multerMock = {
  single: jest
    .fn()
    .mockImplementation(
      (fieldName: string) => (req: any, res: any, next: any) => {
        req.file = {
          fieldname: fieldName,
          originalname: "test.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          buffer: Buffer.from([1, 2, 3]), // Simula um buffer de arquivo
          size: 12345,
          destination: "destination/path",
          filename: "test.jpg",
          path: "path/to/test.jpg",
        };
        next();
      }
    ),
};

//Mockando o banco do prisma
jest.mock("../../prismaClient/prismaClient", () => ({
  prisma: prismaMock,
}));

describe("Fluxo normal", () => {
  //Executar esse trecho a cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Caso de teste 001
  it("Deve ser possível adicionar um novo usuário", async () => {
    //Criando objeto request
    const req = {
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await createUser(req, res);

    //Resultado esperado
    expect(res.status).toHaveBeenCalledWith(200);
  }, 9999);

  //Caso de teste 002
  it("Um usuário deve ser cadastrado com e-mail e telefone único", async () => {
    //Criando objeto request
    const req = {
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await createUser(req, res);

    //Resultado
    expect(prismaMock.user.create).toHaveBeenCalled(); //Verificando se a função create foi criada
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      //Verificando se a função de busca findUnique foi realizada para o e-mail
      where: { email: "john.doe@example.com" },
    });
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      //Verificando se a função de busca findUnique foi realizada para o telefone
      where: { telefone: "123456789" },
    });
    expect(res.status).toHaveBeenCalledWith(200); //Resultado esperado do status
  }, 9999);

  //Caso de test 003
  it("Deve ser possível remover um usuário", async () => {
    //Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f669e";
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: userId });

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
    } as unknown as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await removeUsers(req, res);

    //Resultados
    //Verifica se a função delete foi chamada de forma correta
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User removed",
    });
  });

  //Caso de test 004
  it("Deve ser possível atualizar um usuário", async () => {
    //Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f669e";
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userId,
      name: "John",
      password: "password",
      confirmPassword: "password",
      email: "john@example.com",
      telefone: "123456519",
      latitude: 12.345,
      longitude: 56.782,
    });

    //Criando objeto body
    const updateUser = {
      name: "John Doe",
      password: "password123",
      confirmPassword: "password123",
      email: "john.doe@example.com",
      telefone: "123456789",
      latitude: 12.34,
      longitude: 56.78,
    };

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
      body: updateUser,
    } as unknown as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await editUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: {
        id: userId,
      },
      data: expect.objectContaining({
        name: "John Doe",
        password: expect.any(String),
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      }),
    });
  }, 9999);

  //Caso de test 005
  it("Deve ser possível adicionar uma foto a um usuário já cadastrado", async () => {
    // Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f669e";
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userId,
    });

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
    } as unknown as Request;

    //Criando objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Procedimmento
    const multerMiddleware = multerMock.single("image"); //Simula o middleware multer
    multerMiddleware(req, res, async () => {
      // Chama a função de uploadImage com a simulação da requisição
      await uploadImage(req, res);

      // Verifica se as funções do prisma foram chamadas corretamente
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
      });

      //Resultados
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: {
          id: userId,
        },
        data: {
          image: "test.jpg",
        },
      });

      // Verifica se a resposta foi enviada corretamente
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ massage: "Imagem adicionada" });
    });
  });

  //Caso de test 006
  it("Deve ser possível pesquisar por um usuário já cadastrado", async () => {
    //Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f669e";
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      telefone: "123456789",
      location: {
        latitude: 12.34,
        longitude: 56.78,
      },
      image: "path/to/image",
    });

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
    } as unknown as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Chame a função a ser testada
    await findSpecificUser(req, res);

    // Verifique os resultados esperados
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      id: userId,
      name: "John Doe",
      email: "john.doe@example.com",
      telefone: "123456789",
      location: {
        latitude: 12.34,
        longitude: 56.78,
      },
      image: "path/to/image",
    });
  });
});

describe("Fluxo de exceções", () => {
  //Executar esse trecho a cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Caso de teste 007
  it("Não deve ser permitido a criação de um usuário sem um nome", async () => {
    const req = {
      body: {
        password: "password123",
        confirmPassword: "password123",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The name is mandatory",
    });
  });

  //Caso de teste 008
  it("Não deve ser possível criar um usuário que não possua uma senha", async () => {
    const req = {
      //Criando objeto request
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      //Criando obejto response
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The password is mandatory",
    });
  });

  //Casos de teste 009
  it("Não deve ser possivel cadastrar um usuário em que senha e confirmação de senha são incompatíveis", async () => {
    const req = {
      //Criando objeto request
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "123password",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      //Criando obejto response
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Check your password",
    });
  });

  //Caso de teste 010
  it("Não deve ser possível cadastrar um usuário sem um email", async () => {
    const req = {
      //Criando objeto request
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      //Criando obejto response
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The email is mandatory",
    });
  });

  //Caso de teste 011
  it("Não deve ser possível cadastrar um usuário sem um telefone", async () => {
    const req = {
      //Criando obejto request
      body: {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "password123",
        confirmPassword: "password123",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      //Criando obejto response
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The telefone is mandatory",
    });
  });

  //Caso de teste 012
  it("Não deve ser possível cadastrar um usuário sem a suas posição geográficas", async () => {
    const req = {
      //Criando obejto request
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
        email: "john.doe@example.com",
        telefone: "123456789",
      },
    } as Request;

    const res = {
      //Criando obejto response
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "The location is mandatory",
    });
  });

  //Caso de teste 013
  it("Deve retornar erro se usuário com o mesmo email ou telefone já existe", async () => {
    // Simulando que existe usuário com o mesmo email
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: "existingUserId" });

    const req = {
      body: {
        name: "John Doe",
        password: "password123",
        confirmPassword: "password123",
        email: "john.doe@example.com",
        telefone: "123456789",
        latitude: 12.34,
        longitude: 56.78,
      },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimentos
    await createUser(req, res);

    //Resultados
    //Verificar se a função não foi chamada para o telefone
    expect(prismaMock.user.findUnique).not.toHaveBeenCalledWith(
      expect.objectContaining({ telefone: "123456789" })
    );
    //Verificar a função findUnique para o email
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "john.doe@example.com" },
    });
    //Retorno do status
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      //Retorno da mensagem
      error: "Existing user with this e-mail or with this telefone",
    });
  });

  //Caso de teste 014
  it("Não deve ser possível realizar uma remoção com o id inválido", async () => {
    //Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f66";
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: userId });

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
    } as unknown as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await removeUsers(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid id",
    });
  });

  //Caso de teste 015
  it("Não deve ser possível atualizar um usuário com uma informação já cadastrada a outro usuário", async () => {
    //Supondo que exista um usuário com esse id
    const userId = "026857bb-d5e9-4634-9170-2687a33f669e";
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userId,
      name: "John",
      password: "password",
      confirmPassword: "password",
      email: "john@example.com",
      telefone: "123456519",
      latitude: 12.345,
      longitude: 56.782,
    });

    //Supundo que já exista um outro usuário com informações já cadastradas
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: "035557bb-d5s9-1234-9170-5677a33f664d",
      name: "John Wick",
      password: "password123",
      confirmPassword: "password123",
      email: "john.doe@example.com",
      telefone: "123456789",
      latitude: 12.345,
      longitude: 56.782,
    });

    //Criando objeto body
    const updateUser = {
      name: "John Doe",
      password: "password123",
      confirmPassword: "password123",
      email: "john.doe@example.com",
      telefone: "123456789",
      latitude: 12.34,
      longitude: 56.78,
    };

    //Criando objeto request
    const req = {
      params: {
        id: userId,
      },
      body: updateUser,
    } as unknown as Request;

    //Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    //Procedimento
    await editUser(req, res);

    //Resultados
    expect(res.status).toHaveBeenCalledWith(400);
    //Retornar erro de atualização
    expect(res.json).toHaveBeenCalledWith({
      error: "E-mail or phone is already being used by another user",
    });
  }, 99999);
});
