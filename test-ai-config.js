#!/usr/bin/env node

/**
 * Test script for verifying the AI configuration from LaunchDarkly
 * and testing the chatbot with enhanced logging.
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:5003';
const USER_ID = 'test-user-' + Date.now();

// Function to get the AI config
async function getAIConfig() {
  console.log(`Getting AI config for user: ${USER_ID}`);
  
  try {
    const response = await axios.get(`${API_URL}/api/debug/ai-config?userId=${USER_ID}`);
    
    console.log('Response status:', response.status);
    console.log('AI Config:', JSON.stringify(response.data.config, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error getting AI config:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

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
    console.log('Response message:', response.data.message);
    
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Function to clear LaunchDarkly cache
async function clearLaunchDarklyCache() {
  console.log('Clearing LaunchDarkly cache...');
  
  try {
    // This is a simplified version that just logs the action
    // In a real implementation, you would use the clear-launchdarkly-cache.js script
    console.log('Note: This is a placeholder. To actually clear the cache, run:');
    console.log('node clear-launchdarkly-cache.js');
    
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // First, get the AI config
    console.log('Step 1: Getting AI config');
    await getAIConfig();
    
    // Then, send a message to the chatbot
    console.log('\nStep 2: Sending message to chatbot');
    await sendChatbotMessage('What are some good yoga poses for beginners?');
    
    // Optional: Clear the LaunchDarkly cache and test again
    console.log('\nStep 3: Clearing LaunchDarkly cache');
    await clearLaunchDarklyCache();
    
    // Get the AI config again after clearing cache
    console.log('\nStep 4: Getting AI config after clearing cache');
    console.log('Note: To see the effect of clearing cache, run:');
    console.log('node clear-launchdarkly-cache.js');
    console.log('Then run this script again.');
    
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
