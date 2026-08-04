-- DropForeignKey
ALTER TABLE "Athlete" DROP CONSTRAINT "Athlete_coachId_fkey";

-- AlterTable
ALTER TABLE "Athlete" DROP COLUMN "age",
DROP COLUMN "name",
ADD COLUMN     "birthCityId" TEXT NOT NULL,
ADD COLUMN     "birthCountryId" TEXT NOT NULL,
ADD COLUMN     "birthDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "birthDepartmentId" TEXT NOT NULL,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "documentNumber" TEXT NOT NULL,
ADD COLUMN     "documentTypeId" TEXT NOT NULL,
ADD COLUMN     "educationInstitution" TEXT,
ADD COLUMN     "educationLevelId" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "genderId" TEXT NOT NULL,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "residenceCityId" TEXT NOT NULL,
ADD COLUMN     "residenceCountryId" TEXT NOT NULL,
ADD COLUMN     "residenceDepartmentId" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "coachId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DocumentType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gender" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLevel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EducationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Discipline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Discipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteDiscipline" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteInstitution" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteInstitution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_code_key" ON "DocumentType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentType_name_key" ON "DocumentType"("name");

-- CreateIndex
CREATE INDEX "DocumentType_deletedAt_idx" ON "DocumentType"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gender_code_key" ON "Gender"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Gender_name_key" ON "Gender"("name");

-- CreateIndex
CREATE INDEX "Gender_deletedAt_idx" ON "Gender"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE INDEX "Country_deletedAt_idx" ON "Country"("deletedAt");

-- CreateIndex
CREATE INDEX "Department_countryId_idx" ON "Department"("countryId");

-- CreateIndex
CREATE INDEX "Department_deletedAt_idx" ON "Department"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_countryId_key" ON "Department"("name", "countryId");

-- CreateIndex
CREATE INDEX "City_departmentId_idx" ON "City"("departmentId");

-- CreateIndex
CREATE INDEX "City_deletedAt_idx" ON "City"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_departmentId_key" ON "City"("name", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLevel_code_key" ON "EducationLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EducationLevel_name_key" ON "EducationLevel"("name");

-- CreateIndex
CREATE INDEX "EducationLevel_deletedAt_idx" ON "EducationLevel"("deletedAt");

-- CreateIndex
CREATE INDEX "Discipline_schoolId_idx" ON "Discipline"("schoolId");

-- CreateIndex
CREATE INDEX "Discipline_deletedAt_idx" ON "Discipline"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Discipline_name_schoolId_key" ON "Discipline"("name", "schoolId");

-- CreateIndex
CREATE INDEX "AthleteDiscipline_athleteId_idx" ON "AthleteDiscipline"("athleteId");

-- CreateIndex
CREATE INDEX "AthleteDiscipline_disciplineId_idx" ON "AthleteDiscipline"("disciplineId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteDiscipline_athleteId_disciplineId_key" ON "AthleteDiscipline"("athleteId", "disciplineId");

-- CreateIndex
CREATE INDEX "AthleteInstitution_athleteId_idx" ON "AthleteInstitution"("athleteId");

-- CreateIndex
CREATE INDEX "AthleteInstitution_schoolId_idx" ON "AthleteInstitution"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteInstitution_athleteId_schoolId_key" ON "AthleteInstitution"("athleteId", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_email_key" ON "Athlete"("email");

-- CreateIndex
CREATE INDEX "Athlete_documentTypeId_idx" ON "Athlete"("documentTypeId");

-- CreateIndex
CREATE INDEX "Athlete_genderId_idx" ON "Athlete"("genderId");

-- CreateIndex
CREATE INDEX "Athlete_birthCountryId_idx" ON "Athlete"("birthCountryId");

-- CreateIndex
CREATE INDEX "Athlete_birthDepartmentId_idx" ON "Athlete"("birthDepartmentId");

-- CreateIndex
CREATE INDEX "Athlete_birthCityId_idx" ON "Athlete"("birthCityId");

-- CreateIndex
CREATE INDEX "Athlete_residenceCountryId_idx" ON "Athlete"("residenceCountryId");

-- CreateIndex
CREATE INDEX "Athlete_residenceDepartmentId_idx" ON "Athlete"("residenceDepartmentId");

-- CreateIndex
CREATE INDEX "Athlete_residenceCityId_idx" ON "Athlete"("residenceCityId");

-- CreateIndex
CREATE INDEX "Athlete_educationLevelId_idx" ON "Athlete"("educationLevelId");

-- CreateIndex
CREATE INDEX "Athlete_categoryId_idx" ON "Athlete"("categoryId");

-- CreateIndex
CREATE INDEX "Athlete_coachId_idx" ON "Athlete"("coachId");

-- CreateIndex
CREATE INDEX "Athlete_deletedAt_idx" ON "Athlete"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Athlete_documentTypeId_documentNumber_key" ON "Athlete"("documentTypeId", "documentNumber");

-- CreateIndex
CREATE INDEX "Category_schoolId_idx" ON "Category"("schoolId");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_schoolId_key" ON "Category"("name", "schoolId");

-- CreateIndex
CREATE INDEX "Coach_schoolId_idx" ON "Coach"("schoolId");

-- CreateIndex
CREATE INDEX "Coach_deletedAt_idx" ON "Coach"("deletedAt");

-- CreateIndex
CREATE INDEX "School_deletedAt_idx" ON "School"("deletedAt");

-- CreateIndex
CREATE INDEX "SchoolPlan_schoolId_idx" ON "SchoolPlan"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolPlan_planId_idx" ON "SchoolPlan"("planId");

-- CreateIndex
CREATE INDEX "SchoolPlan_deletedAt_idx" ON "SchoolPlan"("deletedAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Gender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_birthCountryId_fkey" FOREIGN KEY ("birthCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_birthDepartmentId_fkey" FOREIGN KEY ("birthDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_birthCityId_fkey" FOREIGN KEY ("birthCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_residenceCountryId_fkey" FOREIGN KEY ("residenceCountryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_residenceDepartmentId_fkey" FOREIGN KEY ("residenceDepartmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_residenceCityId_fkey" FOREIGN KEY ("residenceCityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_educationLevelId_fkey" FOREIGN KEY ("educationLevelId") REFERENCES "EducationLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "City" ADD CONSTRAINT "City_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discipline" ADD CONSTRAINT "Discipline_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteDiscipline" ADD CONSTRAINT "AthleteDiscipline_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteDiscipline" ADD CONSTRAINT "AthleteDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteInstitution" ADD CONSTRAINT "AthleteInstitution_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteInstitution" ADD CONSTRAINT "AthleteInstitution_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

