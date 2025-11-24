// Test script for the order fetch functionality
// This script is to be run in a Node.js environment to verify integration

const axios = require('axios');

// Mock token for testing - replace with your actual token if needed
const MOCK_TOKEN = 'mock_token';

// Test order ID - replace with an actual order ID from your database
const TEST_ORDER_ID = 'cmi7ml5df000pu4uwecsxdbdc';

// API Base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://besukma.vercel.app';

async function testFetchOrderById() {
    console.log('Testing fetchOrderById functionality...');
    
    try {
        console.log(`Fetching order with ID: ${TEST_ORDER_ID}`);
        
        const response = await axios.get(`${BASE_URL}/api/orders/${TEST_ORDER_ID}`, {
            headers: {
                Authorization: `Bearer ${MOCK_TOKEN}`
            }
        });
        
        console.log('Order fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching order:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        return null;
    }
}

// Run the test
if (require.main === module) {
    testFetchOrderById();
}

module.exports = { testFetchOrderById };