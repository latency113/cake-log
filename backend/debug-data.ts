import prisma from './src/providers/database/database.provider';

async function main() {
  try {
    const orders = await prisma.order.findMany({ take: 5 });
    console.log("Orders sample:", JSON.stringify(orders, null, 2));
    
    const orderBooks = await prisma.orderBook.findMany({ take: 5 });
    console.log("OrderBooks sample:", JSON.stringify(orderBooks, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
