/**
 * Test script for the metrics tracking functionality.
 * This script sends a request to the chatbot endpoint and then retrieves the metrics.
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5003';
const USER_ID = 'test-user-' + Date.now();

// Function to send a message to the chatbot
async function sendChatbotMessage(message) {
  console.log(`Sending message to chatbot: "${message}"`);
  
  try {
    const response = await axios.post(`${API_URL}/api/chatbot/message`, {
      userId: USER_ID,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });
    
    console.log('Response status:', response.status);
    console.log('Response message:', response.data.message.substring(0, 100) + '...');
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to get the chatbot metrics
async function getChatbotMetrics() {
  console.log('Getting chatbot metrics...');
  
  try {
    const response = await axios.get(`${API_URL}/api/chatbot/metrics`);
    
    console.log('Metrics summary:', response.data.summary);
    console.log('Number of metrics entries:', response.data.metrics.length);
    
    // Print the most recent metric
    if (response.data.metrics.length > 0) {
      const latestMetric = response.data.metrics[response.data.metrics.length - 1];
      console.log('Latest metric:');
      console.log('- Model ID:', latestMetric.model_id);
      console.log('- Latency:', latestMetric.latency_ms, 'ms');
      console.log('- Input tokens:', latestMetric.input_token_estimate);
      console.log('- Output tokens:', latestMetric.output_token_estimate);
      console.log('- Status:', latestMetric.status);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting metrics:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Send a message to the chatbot
    await sendChatbotMessage('What are some good yoga poses for beginners?');
    
    // Wait a moment for the metrics to be processed
    console.log('Waiting for metrics to be processed...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the chatbot metrics
    await getChatbotMetrics();
    
    // Send another message
    await sendChatbotMessage('How many calories does yoga burn?');
    
    // Wait a moment for the metrics to be processed
    console.log('Waiting for metrics to be processed...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get the chatbot metrics again
    await getChatbotMetrics();
    
  } catch (error) {
    console.error('Error in main function:', error.message);
  }
}

// Run the main function
main().then(() => {
  console.log('Test completed.');
}).catch(error => {
  console.error('Test failed:', error.message);
});
