import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tags = [
  { name: 'Database', color: 'neo-yellow' },
  { name: 'Prisma', color: 'neo-green' },
  { name: 'Migration', color: 'neo-pink' },
  { name: 'Frontend', color: 'neo-cyan' },
  { name: 'Performance', color: 'neo-orange' },
];

try {
  await Promise.all(
    tags.map((tag) =>
      prisma.tag.upsert({
        where: { name: tag.name },
        update: { color: tag.color },
        create: tag,
      })
    )
  );
} finally {
  await prisma.$disconnect();
}