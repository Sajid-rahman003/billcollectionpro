import { db } from './server/db.js';
import { customers, users } from '@shared/schema';

async function testCustomerTable() {
  try {
    console.log('Testing customer table structure...');
    
    // Check existing users
    const usersResult = await db.select().from(users);
    console.log('Existing users:', usersResult);
    
    // Try to get the table info
    const result = await db.select().from(customers).limit(1);
    console.log('Customer table query successful:', result);
    
    // If we have a user, try to insert a test customer
    if (usersResult.length > 0) {
      const testCustomer = {
        name: 'Test Customer',
        package: '100.00',
        phone: '1234567890',
        address: 'Test Address',
        status: 'due',
        userId: usersResult[0].id
      };
      
      const insertResult = await db.insert(customers).values(testCustomer).returning();
      console.log('Customer insert successful:', insertResult);
      
      // Clean up - delete the test customer
      if (insertResult[0]?.id) {
        await db.delete(customers).where(eq(customers.id, insertResult[0].id));
        console.log('Test customer cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

testCustomerTable();