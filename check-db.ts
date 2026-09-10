import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: 'institution.com',
      },
    },
    select: {
      id: true,
      email: true,
      role: true,
      country: true,
      state: true,
      city: true,
      phone: true,
      address: true,
      createdAt: true,
    },
  });

  console.log('Users:', JSON.stringify(users, null, 2));

  const schools = await prisma.school.findMany({
    where: {
      user: {
        email: {
          contains: 'institution.com',
        },
      },
    },
    select: {
      id: true,
      name: true,
      userId: true,
      character: true,
      headquarters: true,
      website: true,
      representativename: true,
      createdAt: true,
    },
  });

  console.log('Schools:', JSON.stringify(schools, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());