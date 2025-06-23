// scripts/check-task.ts
import { prisma } from '@/lib/prisma'; // Adjust if prisma is in a different path

async function main() {
  const task = await prisma.task.findUnique({
    where: { id: 'cmc3izzeh000bvf8k2ul1me7s' },
  });

  console.log(task || '❌ Task not found');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
