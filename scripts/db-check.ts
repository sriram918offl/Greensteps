import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [badges, challenges, documents, users, hasVector] = await Promise.all([
    prisma.badge.count(),
    prisma.challenge.count(),
    prisma.document.count(),
    prisma.user.count(),
    prisma.$queryRawUnsafe<Array<{ extname: string; extversion: string }>>(
      `SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'`,
    ),
  ]);

  console.log("\n=== GreenSteps DB health ===");
  console.log(`badges        : ${badges}`);
  console.log(`challenges    : ${challenges}`);
  console.log(`documents     : ${documents}`);
  console.log(`users         : ${users}`);
  console.log(`pgvector ext  : ${hasVector.length ? `OK (v${hasVector[0].extversion})` : "MISSING"}`);

  // List models that exist
  const tables = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log(`tables (${tables.length}) :`, tables.map((t) => t.table_name).join(", "));
  console.log("============================\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
