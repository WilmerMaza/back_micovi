-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Character') THEN
    CREATE TYPE "Character" AS ENUM ('PUBLIC', 'PRIVATE');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InstitutionType') THEN
    CREATE TYPE "InstitutionType" AS ENUM ('CLUB', 'ACADEMY', 'FEDERATION', 'ASSOCIATION', 'SCHOOL', 'OTHER');
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SubscriptionStatus') THEN
    CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'SCHEDULED', 'CANCELED', 'EXPIRED');
  END IF;
END $$;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "maxAge" INTEGER, ADD COLUMN IF NOT EXISTS "minAge" INTEGER;
ALTER TABLE "Plan" ADD COLUMN IF NOT EXISTS "billingPeriodMonths" INTEGER NOT NULL DEFAULT 1, ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN IF NOT EXISTS "maxAthletes" INTEGER, ADD COLUMN IF NOT EXISTS "maxCoaches" INTEGER;
ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "character" "Character" NOT NULL, ADD COLUMN IF NOT EXISTS "city" TEXT NOT NULL, ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL, ADD COLUMN IF NOT EXISTS "foundationDate" TIMESTAMP(3), ADD COLUMN IF NOT EXISTS "headquarters" TEXT, ADD COLUMN IF NOT EXISTS "institutionType" "InstitutionType" NOT NULL, ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION, ADD COLUMN IF NOT EXISTS "logo" TEXT, ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION, ADD COLUMN IF NOT EXISTS "representativename" TEXT, ADD COLUMN IF NOT EXISTS "state" TEXT NOT NULL, ADD COLUMN IF NOT EXISTS "taxId" TEXT NOT NULL, ADD COLUMN IF NOT EXISTS "website" TEXT;
ALTER TABLE "SchoolPlan" ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3), ADD COLUMN IF NOT EXISTS "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT, ADD COLUMN IF NOT EXISTS "city" TEXT, ADD COLUMN IF NOT EXISTS "country" TEXT, ADD COLUMN IF NOT EXISTS "phone" TEXT, ADD COLUMN IF NOT EXISTS "state" TEXT;

-- CreateTable
CREATE TABLE "SportDiscipline" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3), CONSTRAINT "SportDiscipline_pkey" PRIMARY KEY ("id"));
CREATE TABLE "SchoolDiscipline" ("id" TEXT NOT NULL, "schoolId" TEXT NOT NULL, "disciplineId" TEXT NOT NULL, "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "SchoolDiscipline_pkey" PRIMARY KEY ("id"));

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SportDiscipline_name_key" ON "SportDiscipline"("name");
CREATE INDEX IF NOT EXISTS "SchoolDiscipline_schoolId_idx" ON "SchoolDiscipline"("schoolId");
CREATE INDEX IF NOT EXISTS "SchoolDiscipline_disciplineId_idx" ON "SchoolDiscipline"("disciplineId");
CREATE UNIQUE INDEX IF NOT EXISTS "SchoolDiscipline_schoolId_disciplineId_key" ON "SchoolDiscipline"("schoolId", "disciplineId");
CREATE UNIQUE INDEX IF NOT EXISTS "Plan_name_key" ON "Plan"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "School_taxId_key" ON "School"("taxId");

-- AddForeignKey
ALTER TABLE "SchoolDiscipline" ADD CONSTRAINT "SchoolDiscipline_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SchoolDiscipline" ADD CONSTRAINT "SchoolDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "SportDiscipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
