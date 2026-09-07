import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const prisma = new PrismaClient();

const DEV_USER_ID = 'dev-user-0000-0000-000000000001';
const DEV_SCHOOL_ID = 'dev-school-0000-0000-000000000001';
const DEV_EMAIL = 'admin@micovi.dev';
const DEV_PASSWORD = 'Admin123!';

async function hashPassword(plain: string): Promise<string> {
  const keyLength = 32;
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(plain, salt, keyLength)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  console.log('Iniciando seed...');

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
    create: { id: '00000000-0000-4000-8000-000000000201', code: 'CO', name: 'Colombia' },
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

  console.log('Catálogos semilla insertados.');

  const hashedPassword = await hashPassword(DEV_PASSWORD);

  const existingUser = await prisma.user.findUnique({ where: { id: DEV_USER_ID } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: DEV_USER_ID,
        email: DEV_EMAIL,
        password: hashedPassword,
        role: 'SCHOOL',
      },
    });
    console.log(`Usuario dev creado: ${DEV_EMAIL}`);
  } else {
    await prisma.user.update({
      where: { id: DEV_USER_ID },
      data: { password: hashedPassword },
    });
    console.log(`Usuario dev actualizado: ${DEV_EMAIL}`);
  }

  const existingSchool = await prisma.school.findUnique({ where: { id: DEV_SCHOOL_ID } });
  if (!existingSchool) {
    await prisma.school.create({
      data: {
        id: DEV_SCHOOL_ID,
        name: 'Institución de Desarrollo',
        userId: DEV_USER_ID,
        character: 'PUBLIC',
        country: 'Colombia',
      },
    });
    console.log('Escuela de desarrollo creada.');
  } else {
    console.log('Escuela de desarrollo ya existe.');
  }

  await prisma.discipline.upsert({
    where: { id: '00000000-0000-4000-8000-000000000601' },
    update: { name: 'Fútbol', schoolId: DEV_SCHOOL_ID, deletedAt: null },
    create: { id: '00000000-0000-4000-8000-000000000601', name: 'Fútbol', schoolId: DEV_SCHOOL_ID },
  });

  await prisma.discipline.upsert({
    where: { id: '00000000-0000-4000-8000-000000000602' },
    update: { name: 'Baloncesto', schoolId: DEV_SCHOOL_ID, deletedAt: null },
    create: {
      id: '00000000-0000-4000-8000-000000000602',
      name: 'Baloncesto',
      schoolId: DEV_SCHOOL_ID,
    },
  });

  await prisma.category.upsert({
    where: { id: '00000000-0000-4000-8000-000000000701' },
    update: { name: 'Sub-15 Masculino', schoolId: DEV_SCHOOL_ID, deletedAt: null },
    create: {
      id: '00000000-0000-4000-8000-000000000701',
      name: 'Sub-15 Masculino',
      schoolId: DEV_SCHOOL_ID,
    },
  });

  await prisma.category.upsert({
    where: { id: '00000000-0000-4000-8000-000000000702' },
    update: { name: 'Sub-17 Femenino', schoolId: DEV_SCHOOL_ID, deletedAt: null },
    create: {
      id: '00000000-0000-4000-8000-000000000702',
      name: 'Sub-17 Femenino',
      schoolId: DEV_SCHOOL_ID,
    },
  });

  console.log('Disciplinas y categorías de desarrollo creadas.');
  console.log('Seed ejecutado correctamente.');
  console.log(`--- CREDENCIALES DE DESARROLLO ---`);
  console.log(`Email:    ${DEV_EMAIL}`);
  console.log(`Password: ${DEV_PASSWORD}`);
  console.log(`Rol:      SCHOOL`);
  console.log(`Escuela:  Institución de Desarrollo (${DEV_SCHOOL_ID})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
