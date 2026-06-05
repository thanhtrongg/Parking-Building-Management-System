import prisma from "./config/prisma.js";

async function main() {
  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  const columns = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
    ORDER BY ordinal_position
  `;

  console.log("Tables");
  console.table(tables);
  console.log("users columns");
  console.table(columns);

  const roleTables = await prisma.$queryRaw`
    SELECT table_name, column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name ILIKE '%role%'
    ORDER BY table_name, ordinal_position
  `;

  console.log("role-related columns");
  console.table(roleTables);
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
