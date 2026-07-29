-- AlterTable: make taxId nullable (unique constraint remains; PostgreSQL allows multiple NULLs)
ALTER TABLE "School" ALTER COLUMN "taxId" DROP NOT NULL;
