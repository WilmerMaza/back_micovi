-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RepresentativeDocumentType') THEN
    CREATE TYPE "RepresentativeDocumentType" AS ENUM ('CC', 'CE', 'NIT', 'TI', 'PA');
  END IF;
END $$;

-- AlterTable: make institutionType, state, city nullable
ALTER TABLE "School" ALTER COLUMN "institutionType" DROP NOT NULL;
ALTER TABLE "School" ALTER COLUMN "state" DROP NOT NULL;
ALTER TABLE "School" ALTER COLUMN "city" DROP NOT NULL;

-- AlterTable: add representativeDocumentType
ALTER TABLE "School" ADD COLUMN IF NOT EXISTS "representativeDocumentType" "RepresentativeDocumentType";
