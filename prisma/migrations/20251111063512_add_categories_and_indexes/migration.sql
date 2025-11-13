/*
  Warnings:

  - You are about to drop the column `creadoEn` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the `Deportista` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Entrenador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Escuela` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlanEscuela` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SCHOOL', 'COACH', 'ATHLETE');

-- DropForeignKey
ALTER TABLE "Deportista" DROP CONSTRAINT "Deportista_entrenadorId_fkey";

-- DropForeignKey
ALTER TABLE "Entrenador" DROP CONSTRAINT "Entrenador_escuelaId_fkey";

-- DropForeignKey
ALTER TABLE "Entrenador" DROP CONSTRAINT "Entrenador_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Escuela" DROP CONSTRAINT "Escuela_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "PlanEscuela" DROP CONSTRAINT "PlanEscuela_escuelaId_fkey";

-- DropForeignKey
ALTER TABLE "PlanEscuela" DROP CONSTRAINT "PlanEscuela_planId_fkey";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "creadoEn",
DROP COLUMN "descripcion",
DROP COLUMN "nombre",
DROP COLUMN "precio",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Deportista";

-- DropTable
DROP TABLE "Entrenador";

-- DropTable
DROP TABLE "Escuela";

-- DropTable
DROP TABLE "PlanEscuela";

-- DropTable
DROP TABLE "Usuario";

-- DropEnum
DROP TYPE "Rol";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "coachId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolPlan" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SchoolPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoachCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoachCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "School_userId_key" ON "School"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userId_key" ON "Coach"("userId");

-- CreateIndex
CREATE INDEX "Coach_schoolId_idx" ON "Coach"("schoolId");

-- CreateIndex
CREATE INDEX "Category_schoolId_idx" ON "Category"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_schoolId_key" ON "Category"("name", "schoolId");

-- CreateIndex
CREATE INDEX "Athlete_coachId_idx" ON "Athlete"("coachId");

-- CreateIndex
CREATE INDEX "Athlete_categoryId_idx" ON "Athlete"("categoryId");

-- CreateIndex
CREATE INDEX "SchoolPlan_schoolId_idx" ON "SchoolPlan"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolPlan_planId_idx" ON "SchoolPlan"("planId");

-- CreateIndex
CREATE INDEX "_CoachCategories_B_index" ON "_CoachCategories"("B");

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolPlan" ADD CONSTRAINT "SchoolPlan_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolPlan" ADD CONSTRAINT "SchoolPlan_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachCategories" ADD CONSTRAINT "_CoachCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachCategories" ADD CONSTRAINT "_CoachCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;
