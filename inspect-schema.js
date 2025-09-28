import { insertEmployeeSchema, insertExpenseSchema } from '@shared/schema';

console.log('Employee schema shape:');
console.log(Object.keys(insertEmployeeSchema.shape));

console.log('\nExpense schema shape:');
console.log(Object.keys(insertExpenseSchema.shape));

// Try to get more details about specific fields
console.log('\nEmployee joinDate field:');
console.log(insertEmployeeSchema.shape.joinDate);

console.log('\nEmployee salary field:');
console.log(insertEmployeeSchema.shape.salary);