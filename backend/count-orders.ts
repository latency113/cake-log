import prisma from './src/providers/database/database.provider';

async function countOrders() {
  const count = await prisma.order.count();
  console.log(`Total orders: ${count}`);
  
  const nullBookId = await prisma.order.count({
      where: { book_id: null }
  });
  console.log(`Orders with null book_id: ${nullBookId}`);
  
  const withBookNumber = await prisma.order.findMany({
      where: { book_number: { not: null } },
      select: { id: true, book_number: true }
  });
  console.log(`Orders with book_number not null: ${withBookNumber.length}`);
  if (withBookNumber.length > 0) {
      console.log('Sample book_number:', withBookNumber[0].book_number);
  }
}

countOrders()
  .catch(e => console.error(e));
