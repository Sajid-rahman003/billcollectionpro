// Test employee creation directly with proper data formatting
async function testEmployeeCreation() {
  try {
    console.log('Testing employee creation...');
    
    // Test data with proper formatting for the API
    const employeeData = {
      name: "Test Employee",
      employeeNumber: "EMP001",
      position: "Developer",
      email: "test@example.com",
      phone: "1234567890",
      salary: "50000.00", // Convert to string for decimal type
      joinDate: new Date().toISOString(), // Send full ISO date string
      status: "active"
    };
    
    console.log('Employee data:', employeeData);
    
    // Call the API endpoint
    const response = await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData)
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('Employee test failed:', error);
  }
}

testEmployeeCreation();