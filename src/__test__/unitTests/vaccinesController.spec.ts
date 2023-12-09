//Criando o mock do prisma
const prismaMock = {
  vaccine: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

//Importando dependências
import { Request, Response } from "express";
import {
  createVaccines,
  editVaccine,
  removeVaccine,
} from "../../controllers/vaccinesController";
import { v4 as uuid } from "uuid";

//Mokando o banco de dados
jest.mock("../../prismaClient/prismaClient", () => ({
  prisma: prismaMock,
}));

describe("Testando o fluxo normal da Api", () => {
  //Executar esse trecho a cada teste
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //Caso de teste 001 - para a função createVaccine
  it("Deve ser possível adicionar uma nova vacina", async () => {
    // Criando o objeto request
    const req = {
      body: {
        name: "Vacina-test",
        type: "test",
        manufacturer: "by test",
        description: "Is a test",
        contraIndication: "not pass in test",
      },
    } as Request;

    // Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Adicionando a vacina
    await createVaccines(req, res);

    // Resultados esperado
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Caso de teste 002 - para a função editVaccine
  it("Deve ser possívle editar uma vacina existente", async () => {
    // Criando um id
    const vaccineId: String = uuid();
    prismaMock.vaccine.findUnique.mockResolvedValueOnce({
      id: vaccineId,
      name: "Vacina-test1",
      type: "test1",
      manufacturer: "by test1",
      description: "Is a test1",
      contraIndication: "not pass in test2.1",
    });

    // Criando o objeto request
    const updateVaccine = {
      name: "Vacina-test2",
      type: "test2",
      manufacturer: "by test2",
      description: "Is a test2",
      contraIndication: "not pass in test2",
    };
    const req = {
      params: {
        id: vaccineId,
      },
      body: updateVaccine,
    } as unknown as Request;

    // Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Procedimento para atualizar a vacina
    await editVaccine(req, res);

    // Resultados esperados
    expect(prismaMock.vaccine.update).toHaveBeenCalledWith({
      data: updateVaccine,
      where: {
        id: vaccineId,
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Updated Vaccine",
    });
  });

  //Caso de teste 003 - para a função removeVaccine
 it("Deve ser possível remover uma vacina já cadastrada", async () => {
    // Criando o objeto request
    const vaccineId: string = uuid();
    prismaMock.vaccine.findUnique.mockResolvedValueOnce({ id: vaccineId });

    const req = {
      params: {
        id: vaccineId,
      },
    } as unknown as Request;

    // Criando o objeto response
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Removendo vacina
    await removeVaccine(req, res);

    // Resultados esperados
    // Verificando se a função findUnique foi chamada de forma correta
    expect(prismaMock.vaccine.findUnique).toHaveBeenCalledWith({
      where: { id: vaccineId },
    });

    // Verificando se a função delete foi chamada de forma correta
    expect(prismaMock.vaccine.delete).toHaveBeenCalledWith({
      where: { id: vaccineId },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Vaccine removed",
    });
  });
});
