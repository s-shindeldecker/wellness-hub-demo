#!/usr/bin/env node

/**
 * This script clears any LaunchDarkly-related entries from localStorage
 * to ensure the application uses the latest flag values from LaunchDarkly.
 * 
 * Run this script if you're experiencing issues with feature flags not updating.
 */

const http = require('http');
const { exec } = require('child_process');

// Create a simple HTTP server to serve a script that will clear localStorage
const server = http.createServer((req, res) => {
  if (req.url === '/clear-cache') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Clear LaunchDarkly Cache</title>
        <script>
          // Function to clear LaunchDarkly entries from localStorage
          function clearCache() {
            try {
              // Get all keys from localStorage
              const keys = Object.keys(localStorage);
              
              // Find and remove LaunchDarkly-related entries
              const ldKeys = keys.filter(key => key.startsWith('ld:') || key.includes('launchdarkly'));
              
              if (ldKeys.length > 0) {
                ldKeys.forEach(key => {
                  console.log('Removing:', key);
                  localStorage.removeItem(key);
                });
                
                document.getElementById('result').innerHTML = 
                  '<span class="success">Successfully cleared ' + ldKeys.length + 
                  ' LaunchDarkly entries from localStorage.</span>';
              } else {
                document.getElementById('result').innerHTML = 
                  '<span class="info">No LaunchDarkly entries found in localStorage.</span>';
              }
            } catch (error) {
              document.getElementById('result').innerHTML = 
                '<span class="error">Error: ' + error.message + '</span>';
            }
          }
          
          // Clear cache when the page loads
          window.onload = clearCache;
        </script>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
          .info { color: blue; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>LaunchDarkly Cache Cleaner</h1>
        <p>This tool clears any LaunchDarkly-related entries from your browser's localStorage.</p>
        <p id="result">Clearing cache...</p>
        <p>Close this window and refresh the Wellness Hub application to see the changes.</p>
        <p><strong>Note:</strong> After clearing the cache, the application will use the latest flag values from LaunchDarkly.</p>
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
  console.log('Cache cleaner running at http://localhost:3456/clear-cache');
  
  // Open the browser to the cache cleaner page
  const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${openCommand} http://localhost:3456/clear-cache`, (error) => {
    if (error) {
      console.error('Error opening browser:', error);
    }
    
    // Keep the server running for a short time to allow the page to load
    console.log('Server will automatically close in 10 seconds...');
    setTimeout(() => {
      server.close(() => {
        console.log('Server closed');
        console.log('Now refresh the Wellness Hub application to use the latest flag values from LaunchDarkly.');
      });
    }, 10000);
  });
});
