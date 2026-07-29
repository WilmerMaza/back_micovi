-- CreateEnum
CREATE TYPE "RepresentativeDocumentType" AS ENUM ('CC', 'CE', 'NIT', 'TI', 'PA');

-- AlterTable: make institutionType, state, city nullable
ALTER TABLE "School" ALTER COLUMN "institutionType" DROP NOT NULL;
ALTER TABLE "School" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "School" ALTER COLUMN "city" DROP NOT NULL;

-- AlterTable: add representativeDocumentType
ALTER TABLE "School" ADD COLUMN "representativeDocumentType" "RepresentativeDocumentType";
