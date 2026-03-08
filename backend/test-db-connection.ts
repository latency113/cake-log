import { PrismaClient } from "./src/providers/database/generated/client";

async function testConnection() {
  const dbUrl = "postgresql://postgres:mysecretpassword@localhost:5432/nvccake";
  console.log("Testing connection to:", dbUrl);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  try {
    console.log("Attempting to connect...");
    await prisma.$connect();
    console.log("✅ Connection successful!");

    console.log("Attempting to query users...");
    const users = await prisma.user.findMany({ take: 1 });
    console.log("✅ Users query successful. Found:", users.length, "users.");
    
    console.log("Attempting to query departments...");
    const depts = await prisma.department.findMany({ take: 1 });
    console.log("✅ Departments query successful. Found:", depts.length, "departments.");

  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
