import prisma from './src/providers/database/database.provider';

async function resetToOriginal() {
  console.log('Moving data back to book_number...');
  const orders = await prisma.order.findMany({
    include: { book: true }
  });

  console.log(`Found ${orders.length} orders to process.`);

  for (const order of orders) {
    if (order.book) {
      await prisma.order.update({
        where: { id: order.id },
        data: { 
          book_number: order.book.bookNumber,
          book_id: null 
        }
      });
    }
  }
  console.log('Reset complete. All orders now have book_number and book_id is null.');
}

resetToOriginal().catch(console.error);
