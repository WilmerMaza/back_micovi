import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SCHOOL_ID = 'a4adeb57-6432-4e00-a664-47449e0c00c1';

async function main() {
  const catalogs = {
    documentTypes: [
      { id: '00000000-0000-4000-8000-000000000001', code: 'CC', name: 'Cédula de ciudadanía' },
      { id: '00000000-0000-4000-8000-000000000002', code: 'TI', name: 'Tarjeta de identidad' },
      { id: '00000000-0000-4000-8000-000000000003', code: 'CE', name: 'Cédula de extranjería' },
      { id: '00000000-0000-4000-8000-000000000004', code: 'PA', name: 'Pasaporte' },
    ],
    genders: [
      { id: '00000000-0000-4000-8000-000000000101', code: 'M', name: 'Masculino' },
      { id: '00000000-0000-4000-8000-000000000102', code: 'F', name: 'Femenino' },
    ],
    educationLevels: [
      { id: '00000000-0000-4000-8000-000000000501', code: 'PRIM', name: 'Primaria' },
      { id: '00000000-0000-4000-8000-000000000502', code: 'SEC', name: 'Secundaria' },
      { id: '00000000-0000-4000-8000-000000000503', code: 'TEC', name: 'Técnico/Tecnológico' },
      { id: '00000000-0000-4000-8000-000000000504', code: 'PROF', name: 'Profesional' },
    ],
  };

  for (const doc of catalogs.documentTypes) {
    await prisma.documentType.upsert({
      where: { id: doc.id },
      update: { code: doc.code, name: doc.name, deletedAt: null },
      create: doc,
    });
  }

  for (const gender of catalogs.genders) {
    await prisma.gender.upsert({
      where: { id: gender.id },
      update: { code: gender.code, name: gender.name, deletedAt: null },
      create: gender,
    });
  }

  for (const level of catalogs.educationLevels) {
    await prisma.educationLevel.upsert({
      where: { id: level.id },
      update: { code: level.code, name: level.name, deletedAt: null },
      create: level,
    });
  }

  await prisma.country.upsert({
    where: { id: '00000000-0000-4000-8000-000000000201' },
    update: { code: 'CO', name: 'Colombia', deletedAt: null },
    create: {
      id: '00000000-0000-4000-8000-000000000201',
      code: 'CO',
      name: 'Colombia',
    },
  });

  await prisma.department.upsert({
    where: { id: '00000000-0000-4000-8000-000000000301' },
    update: {
      name: 'Antioquia',
      countryId: '00000000-0000-4000-8000-000000000201',
      deletedAt: null,
    },
    create: {
      id: '00000000-0000-4000-8000-000000000301',
      name: 'Antioquia',
      countryId: '00000000-0000-4000-8000-000000000201',
    },
  });

  await prisma.city.upsert({
    where: { id: '00000000-0000-4000-8000-000000000401' },
    update: {
      name: 'Medellín',
      departmentId: '00000000-0000-4000-8000-000000000301',
      deletedAt: null,
    },
    create: {
      id: '00000000-0000-4000-8000-000000000401',
      name: 'Medellín',
      departmentId: '00000000-0000-4000-8000-000000000301',
    },
  });

  const school = await prisma.school.findFirst({ where: { id: SCHOOL_ID, deletedAt: null } });
  if (school) {
    await prisma.discipline.upsert({
      where: { id: '00000000-0000-4000-8000-000000000601' },
      update: { name: 'Fútbol', schoolId: SCHOOL_ID, deletedAt: null },
      create: {
        id: '00000000-0000-4000-8000-000000000601',
        name: 'Fútbol',
        schoolId: SCHOOL_ID,
      },
    });

    await prisma.category.upsert({
      where: { id: '00000000-0000-4000-8000-000000000701' },
      update: { name: 'Sub-15 Masculino', schoolId: SCHOOL_ID, deletedAt: null },
      create: {
        id: '00000000-0000-4000-8000-000000000701',
        name: 'Sub-15 Masculino',
        schoolId: SCHOOL_ID,
      },
    });
  }

  console.log('Seed ejecutado correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
