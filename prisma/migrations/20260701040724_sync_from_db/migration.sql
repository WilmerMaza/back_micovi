/*
  Warnings:

  - You are about to drop the column `address` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `School` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `character` to the `School` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Character" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'SCHEDULED', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "billingPeriodMonths" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxAthletes" INTEGER,
ADD COLUMN     "maxCoaches" INTEGER;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "address",
DROP COLUMN "phone",
ADD COLUMN     "character" "Character" NOT NULL,
ADD COLUMN     "headquarters" TEXT,
ADD COLUMN     "representativename" TEXT,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "SchoolPlan" ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
