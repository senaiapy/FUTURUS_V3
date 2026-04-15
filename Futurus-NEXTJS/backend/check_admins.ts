import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('Admins found:', JSON.stringify(admins, null, 2));

  const users = await prisma.user.findMany();
  console.log('Users found:', JSON.stringify(users.length, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
