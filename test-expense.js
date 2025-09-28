// Test expense creation directly with proper data formatting
async function testExpenseCreation() {
  try {
    console.log('Testing expense creation...');
    
    // Test data with proper formatting for the API
    const expenseData = {
      expenseNumber: "EXP-" + Math.random().toString(36).substring(2, 8).toUpperCase(), // Generate unique expense number
      description: "Office Supplies",
      category: "Office",
      amount: "150.00", // Convert to string for decimal type
      expenseDate: new Date().toISOString(), // Send full ISO date string
      employeeId: null // Send null instead of empty string for optional foreign key
    };
    
    console.log('Expense data:', expenseData);
    
    // Call the API endpoint
    const response = await fetch('http://localhost:3000/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('Expense test failed:', error);
  }
}

testExpenseCreation();