import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 12);
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { password },
    create: {
      username: 'admin',
      email: 'admin@futurus.net.br',
      password
    }
  });
  console.log('Admin password updated to: admin123');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
