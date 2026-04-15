import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || "postgresql://galo:galo@localhost:5432/futurus_fullstack?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  await prisma.market.update({
    where: { slug: 'lula' },
    data: {
      image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Lula_em_2023.jpg'
    }
  });
  console.log('Market image updated successfully');
}

main().catch(console.error).finally(() => prisma.$disconnect());
