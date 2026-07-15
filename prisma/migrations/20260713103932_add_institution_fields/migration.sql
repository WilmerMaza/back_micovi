-- CreateEnum
CREATE TYPE "Character" AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE "InstitutionType" AS ENUM ('CLUB', 'ACADEMY', 'FEDERATION', 'ASSOCIATION', 'SCHOOL', 'OTHER');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'SCHEDULED', 'CANCELED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "maxAge" INTEGER, ADD COLUMN "minAge" INTEGER;
ALTER TABLE "Plan" ADD COLUMN "billingPeriodMonths" INTEGER NOT NULL DEFAULT 1, ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "maxAthletes" INTEGER, ADD COLUMN "maxCoaches" INTEGER;
ALTER TABLE "School" ADD COLUMN "character" "Character" NOT NULL, ADD COLUMN "city" TEXT NOT NULL, ADD COLUMN "country" TEXT NOT NULL, ADD COLUMN "foundationDate" TIMESTAMP(3), ADD COLUMN "headquarters" TEXT, ADD COLUMN "institutionType" "InstitutionType" NOT NULL, ADD COLUMN "latitude" DOUBLE PRECISION, ADD COLUMN "logo" TEXT, ADD COLUMN "longitude" DOUBLE PRECISION, ADD COLUMN "representativename" TEXT, ADD COLUMN "state" TEXT NOT NULL, ADD COLUMN "taxId" TEXT NOT NULL, ADD COLUMN "website" TEXT;
ALTER TABLE "SchoolPlan" ADD COLUMN "canceledAt" TIMESTAMP(3), ADD COLUMN "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "address" TEXT, ADD COLUMN "city" TEXT, ADD COLUMN "country" TEXT, ADD COLUMN "phone" TEXT, ADD COLUMN "state" TEXT;

-- CreateTable
CREATE TABLE "SportDiscipline" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3), CONSTRAINT "SportDiscipline_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SchoolDiscipline" ("id" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "disciplineId" TEXT NOT NULL, "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SchoolDiscipline_pkey" PRIMARY KEY ("id"));

-- CreateIndex
CREATE UNIQUE INDEX "SportDiscipline_name_key" ON "SportDiscipline"("name");
CREATE INDEX "SchoolDiscipline_schoolId_idx" ON "SchoolDiscipline"("schoolId");
CREATE INDEX "SchoolDiscipline_disciplineId_idx" ON "SchoolDiscipline"("disciplineId");
CREATE UNIQUE INDEX "SchoolDiscipline_schoolId_disciplineId_key" ON "SchoolDiscipline"("schoolId", "disciplineId");
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");
CREATE UNIQUE INDEX "School_taxId_key" ON "School"("taxId");

-- AddForeignKey
ALTER TABLE "SchoolDiscipline" ADD CONSTRAINT "SchoolDiscipline_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchoolDiscipline" ADD CONSTRAINT "SchoolDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SportDiscipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
