import prisma from './src/providers/database/database.provider';

async function checkMigration() {
  const pendingOrders = await prisma.order.count({
    where: { book_id: null }
  });
  
  console.log(`Orders with null book_id: ${pendingOrders}`);
  
  if (pendingOrders > 0) {
    console.warn("WARNING: Some orders were not migrated!");
    const sample = await prisma.order.findMany({
      where: { book_id: null },
      take: 5
    });
    console.log("Sample:", sample);
  } else {
    console.log("All orders migrated successfully.");
  }
}

checkMigration();
