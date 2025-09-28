// Use built-in fetch if available (Node.js 18+)
async function testCustomerAPI() {
  try {
    console.log('Testing customer API endpoint...');
    
    // Test data
    const customerData = {
      name: 'API Test Customer',
      package: '150.00',
      phone: '9876543210',
      address: 'API Test Address',
      status: 'due'
    };
    
    console.log('Sending customer data:', customerData);
    
    // Call the API endpoint
    const response = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData)
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', result);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testCustomerAPI();