-- CreateTable
CREATE TABLE "User" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Vaccine" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contraIndication" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VaccinationCalendar" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "local" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "places" INTEGER NOT NULL,
    "status" TEXT,
    "observation" TEXT,
    "responsible" TEXT NOT NULL,
    "idVaccine" TEXT NOT NULL,
    CONSTRAINT "VaccinationCalendar_idVaccine_fkey" FOREIGN KEY ("idVaccine") REFERENCES "Vaccine" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vaccination" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "quantityApplied" INTEGER,
    "idUser" TEXT,
    "idVaccine" TEXT NOT NULL,
    CONSTRAINT "Vaccination_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User" ("_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Vaccination_idVaccine_fkey" FOREIGN KEY ("idVaccine") REFERENCES "Vaccine" ("_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestReservation" (
    "_id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "idUser" TEXT,
    "idCalendar" TEXT,
    CONSTRAINT "RequestReservation_idCalendar_fkey" FOREIGN KEY ("idCalendar") REFERENCES "VaccinationCalendar" ("_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "RequestReservation_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User" ("_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telefone_key" ON "User"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Vaccine_name_key" ON "Vaccine"("name");
