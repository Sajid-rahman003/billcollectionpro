// Test exactly what the frontend sends
async function testFrontendData() {
  try {
    console.log('Testing frontend data...');
    
    // Simulate exactly what the frontend sends
    const frontendData = {
      name: "Test Customer",
      package: "0",  // This is a string as in the frontend
      phone: "",
      address: "",
      status: "due"
    };
    
    console.log('Frontend data:', frontendData);
    
    // Call the API endpoint
    const response = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frontendData)
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', result);
    
    // Now test with temporary close status
    const frontendDataWithTempClose = {
      name: "Test Customer Temp Close",
      package: "100",
      phone: "1234567890",
      address: "Test Address",
      status: "temporary close"  // This is the new status we added
    };
    
    console.log('Frontend data with temp close:', frontendDataWithTempClose);
    
    // Call the API endpoint
    const response2 = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frontendDataWithTempClose)
    });
    
    const result2 = await response2.json();
    console.log('API Response Status (temp close):', response2.status);
    console.log('API Response (temp close):', result2);
    
  } catch (error) {
    console.error('Frontend test failed:', error);
  }
}

testFrontendData();