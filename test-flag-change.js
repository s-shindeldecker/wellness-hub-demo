#!/usr/bin/env node

/**
 * This script simulates a LaunchDarkly flag change by directly updating the localStorage
 * where the LaunchDarkly React SDK stores its flag values. This is for testing purposes only.
 * 
 * In a real environment, you would change the flag in the LaunchDarkly dashboard.
 */

// Usage: node test-flag-change.js [variation]
// Example: node test-flag-change.js variation_2

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

// Get the variation from command line arguments
const variation = process.argv[2] || 'variation_2';
if (!['variation_1', 'variation_2', 'variation_3', 'variation_4'].includes(variation)) {
  console.error('Invalid variation. Must be one of: variation_1, variation_2, variation_3, variation_4');
  process.exit(1);
}

// Create a simple HTTP server to serve a script that will update the localStorage
const server = http.createServer((req, res) => {
  if (req.url === '/update-flags') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Update LaunchDarkly Flags</title>
        <script>
          // Function to update the LaunchDarkly flags in localStorage
          function updateFlags() {
            try {
              // Get the current LaunchDarkly flags from localStorage
              let ldUserKey = Object.keys(localStorage).find(key => key.startsWith('ld:'));
              
              // If not found, try alternative formats
              if (!ldUserKey) {
                ldUserKey = Object.keys(localStorage).find(key => key.includes('launchdarkly'));
              }
              
              if (!ldUserKey) {
                // If still not found, create a new entry
                document.getElementById('result').innerHTML = 'LaunchDarkly user key not found in localStorage. Creating a new entry...';
                
                // Create a new LaunchDarkly entry in localStorage
                const newLdData = {
                  $schema: "https://raw.githubusercontent.com/launchdarkly/js-client-sdk/master/src/__tests__/schema.json",
                  features: {
                    'service-sort-experiment': {
                      value: '${variation}',
                      version: 1,
                      variation: 0,
                      trackEvents: true
                    },
                    'provider-image-flag': {
                      value: 'Standard images', // Default to standard images
                      version: 1,
                      variation: 0,
                      trackEvents: true
                    }
                  }
                };
                
                // Use a standard key format
                const newLdUserKey = 'ld:anonymous-user';
                localStorage.setItem(newLdUserKey, JSON.stringify(newLdData));
                
                document.getElementById('result').innerHTML = 'Created new LaunchDarkly entry in localStorage. Refresh the app to see changes.';
                document.getElementById('flags').textContent = JSON.stringify(newLdData.features, null, 2);
                return;
              }
              
              // Parse the current flags
              const ldData = JSON.parse(localStorage.getItem(ldUserKey));
              console.log('Found LaunchDarkly data:', ldUserKey, ldData);
              
              // Update the service-sort-experiment flag
              if (ldData && ldData.features) {
                ldData.features['service-sort-experiment'] = {
                  value: '${variation}',
                  version: ldData.features['service-sort-experiment']?.version + 1 || 1,
                  variation: 0,
                  trackEvents: true
                };
                
                // Keep the provider-image-flag unchanged
                // This ensures the provider-image-flag is independent of the service-sort-experiment flag
                
                // Save the updated flags back to localStorage
                localStorage.setItem(ldUserKey, JSON.stringify(ldData));
                
                document.getElementById('result').innerHTML = 'Flags updated successfully! Refresh the app to see changes.';
                document.getElementById('flags').textContent = JSON.stringify(ldData.features, null, 2);
              } else {
                document.getElementById('result').innerHTML = 'Error: LaunchDarkly data not found or invalid format';
              }
            } catch (error) {
              document.getElementById('result').innerHTML = 'Error: ' + error.message;
            }
          }
          
          // Update flags when the page loads
          window.onload = updateFlags;
        </script>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>LaunchDarkly Flag Update</h1>
        <p>Updating service-sort-experiment flag to: <strong>${variation}</strong></p>
        <p id="result">Updating flags...</p>
        <h2>Updated Flags:</h2>
        <pre id="flags">Loading...</pre>
        <p>Close this window and refresh the app to see the changes.</p>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start the server on port 3456
server.listen(3456, () => {
  console.log('Flag update server running at http://localhost:3456/update-flags');
  console.log(`Setting service-sort-experiment flag to: ${variation}`);
  
  // Open the browser to the update page
  const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${openCommand} http://localhost:3456/update-flags`, (error) => {
    if (error) {
      console.error('Error opening browser:', error);
    }
    
    // Keep the server running for a short time to allow the page to load
    console.log('Server will automatically close in 10 seconds...');
    setTimeout(() => {
      server.close(() => {
        console.log('Server closed');
        console.log('Now refresh your app to see the changes!');
      });
    }, 10000);
  });
});
