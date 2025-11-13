/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the `_CoachCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Athlete" DROP CONSTRAINT "Athlete_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "_CoachCategories" DROP CONSTRAINT "_CoachCategories_A_fkey";

-- DropForeignKey
ALTER TABLE "_CoachCategories" DROP CONSTRAINT "_CoachCategories_B_fkey";

-- DropIndex
DROP INDEX "Athlete_categoryId_idx";

-- DropIndex
DROP INDEX "Athlete_coachId_idx";

-- DropIndex
DROP INDEX "Category_name_schoolId_key";

-- DropIndex
DROP INDEX "Category_schoolId_idx";

-- DropIndex
DROP INDEX "Coach_schoolId_idx";

-- DropIndex
DROP INDEX "SchoolPlan_planId_idx";

-- DropIndex
DROP INDEX "SchoolPlan_schoolId_idx";

-- AlterTable
ALTER TABLE "Athlete" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "_CoachCategories";

-- CreateTable
CREATE TABLE "CoachCategory" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachCategory_coachId_idx" ON "CoachCategory"("coachId");

-- CreateIndex
CREATE INDEX "CoachCategory_categoryId_idx" ON "CoachCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachCategory_coachId_categoryId_key" ON "CoachCategory"("coachId", "categoryId");

-- AddForeignKey
ALTER TABLE "CoachCategory" ADD CONSTRAINT "CoachCategory_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachCategory" ADD CONSTRAINT "CoachCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
