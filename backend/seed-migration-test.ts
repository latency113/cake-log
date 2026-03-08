import prisma from './src/providers/database/database.provider';

async function main() {
  console.log('Seeding data for migration test...');
  
  // Create a dummy user first (required for Order)
  const user = await prisma.user.create({
    data: {
      firstname: 'Migration',
      lastname: 'Test',
      username: 'migration_test_user',
      password: 'password',
      role: 'USER'
    }
  });

  // Create an Order with book_number but NO book_id
  // Note: We need to bypass the fact that we might have constraints if any remaining
  // But book_id is optional now.
  
  // We need to be careful: The current OrderBook table exists and has constraints?
  // Order has book_id optional.
  
  // If we try to create an order, we must satisfy other relations like user_id.
  
  // Wait, I cannot insert `book_number` if the Prisma Client hasn't been regenerated?
  // `migrate dev` automatically generates the client.
  
  await prisma.order.create({
    data: {
      user_id: user.id,
      customerName: 'Test Customer',
      orderDate: new Date(),
      totalPrice: 100,
      book_number: 'BOOK-001', // simulating old data
      book_id: null, // no relation yet
      number: '001',
      phone: '1234567890',
      pickup_date: new Date(),
      time_type: 'morning',
      deposit: 50,
      advisor: 'Advisor A',
      status: 'pending'
    } as any // cast to any because TS might complain if types aren't perfectly updated in editor view
  });

  console.log('Seeding complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    // We don't disconnect because the provider manages it, but good practice in scripts
  });
