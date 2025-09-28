import { insertEmployeeSchema } from '@shared/schema';

// Test data similar to what we're sending
const testData = {
  name: "Test Employee",
  employeeNumber: "EMP001",
  position: "Developer",
  email: "test@example.com",
  phone: "1234567890",
  salary: "50000.00",
  joinDate: new Date().toISOString(), // This is a string
  status: "active"
};

console.log('Testing Zod schema parsing...');
console.log('Test data:', testData);

try {
  const result = insertEmployeeSchema.parse(testData);
  console.log('Parse successful:', result);
} catch (error) {
  console.log('Parse failed:', error);
}

// Try with a Date object instead
const testDataWithDate = {
  name: "Test Employee",
  employeeNumber: "EMP001",
  position: "Developer",
  email: "test@example.com",
  phone: "1234567890",
  salary: "50000.00",
  joinDate: new Date(), // This is a Date object
  status: "active"
};

console.log('\nTesting with Date object...');
console.log('Test data with Date:', testDataWithDate);

try {
  const result = insertEmployeeSchema.parse(testDataWithDate);
  console.log('Parse successful:', result);
} catch (error) {
  console.log('Parse failed:', error);
}