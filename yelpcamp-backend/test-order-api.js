const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:5000/api';
const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN || 'your-test-token-here';

// Sample test data
const testUserId = '64f8a123456789abcdef0120'; // Replace with actual user ID
const testOrderData = {
  items: [
    {
      productId: '64f8a123456789abcdef0123', // Replace with actual product ID
      quantity: 2
    }
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    country: 'USA'
  }
};

// Test token-based authentication
async function testTokenBasedOrder() {
  console.log('Testing token-based order creation...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, {
      userId: testUserId,
      ...testOrderData
    }, {
      headers: {
        'Authorization': `Bearer ${API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Token-based order creation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Token-based order creation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test session-based authentication (requires login first)
async function testSessionBasedOrder() {
  console.log('Testing session-based order creation...');
  console.log('Note: This requires a valid session cookie from logging in first.');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/orders`, testOrderData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Session-based order creation successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Session-based order creation failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Testing Order API with different authentication methods\n');
  
  // Test 1: Token-based authentication
  try {
    await testTokenBasedOrder();
  } catch (error) {
    console.log('Token-based test failed, continuing...\n');
  }
  
  console.log(''); // Empty line for readability
  
  // Test 2: Session-based authentication
  try {
    await testSessionBasedOrder();
  } catch (error) {
    console.log('Session-based test failed (expected if not logged in)\n');
  }
  
  console.log('\n📝 Usage Notes:');
  console.log('1. For token-based auth: Set API_ACCESS_TOKEN environment variable');
  console.log('2. For session-based auth: Login through web app first');
  console.log('3. Replace test IDs with actual user and product IDs from your database');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testTokenBasedOrder,
  testSessionBasedOrder,
  runTests
}; 