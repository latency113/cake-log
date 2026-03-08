import prisma from './src/providers/database/database.provider';

async function migrateData() {
  console.log('Starting data migration...');
  
  // Find orders where book_id is null
  const orders = await prisma.order.findMany({
    where: { 
      book_id: null
    }
  });
  
  console.log(`Found ${orders.length} orders to migrate.`);

  for (const order of orders) {
    if (order.book_number) {
      console.log(`Migrating Order ID: ${order.id}, Book Number: ${order.book_number}`);
      
      // 1. Find or create OrderBook
      const orderBook = await prisma.orderBook.upsert({
        where: { bookNumber: order.book_number },
        update: {},
        create: { 
          bookNumber: order.book_number,
          startNumber: "001", 
          endNumber: "050" 
        },
      });

      // 2. Update Order to link to OrderBook
      await prisma.order.update({
        where: { id: order.id },
        data: { book_id: orderBook.id }
      });
      
      console.log(`Linked Order ${order.id} to OrderBook ${orderBook.id}`);
    } else {
        console.warn(`Order ${order.id} has no book_number. Skipping.`);
    }
  }
  
  console.log('Data migration complete.');
}

migrateData()
  .catch(e => console.error(e));
