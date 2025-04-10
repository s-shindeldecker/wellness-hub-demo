#!/usr/bin/env node

/**
 * This script cleans up the LaunchDarkly test environment by:
 * 1. Removing any localStorage entries related to LaunchDarkly
 * 2. Providing instructions on how to use the LaunchDarkly dashboard
 * 
 * Run this script if you're experiencing issues with feature flags not updating.
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server to serve a script that will clear localStorage
const server = http.createServer((req, res) => {
  if (req.url === '/cleanup') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LaunchDarkly Cleanup</title>
        <script>
          // Function to clear LaunchDarkly entries from localStorage
          function cleanupLaunchDarkly() {
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
          window.onload = cleanupLaunchDarkly;
        </script>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          h2 { color: #0080ff; margin-top: 30px; }
          .success { color: green; font-weight: bold; }
          .error { color: red; font-weight: bold; }
          .info { color: blue; font-weight: bold; }
          .note { background-color: #f5f5f5; padding: 15px; border-left: 4px solid #0080ff; margin: 20px 0; }
          code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
          ul { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>LaunchDarkly Cleanup</h1>
        <p>This tool clears any LaunchDarkly-related entries from your browser's localStorage.</p>
        <p id="result">Cleaning up LaunchDarkly entries...</p>
        
        <div class="note">
          <strong>Note:</strong> After clearing the cache, the application will use the latest flag values from LaunchDarkly.
        </div>
        
        <h2>Using LaunchDarkly Dashboard Instead of Test Scripts</h2>
        <p>The test scripts (test-flag-change.js, test-image-flag.js, etc.) were created for development purposes. 
        For real usage, you should use the LaunchDarkly dashboard to control feature flags:</p>
        
        <ul>
          <li><strong>service-sort-experiment</strong> - Controls the order of service categories</li>
          <li><strong>provider-image-flag</strong> - Controls the image quality (standard or enhanced)</li>
        </ul>
        
        <h2>Steps to Use LaunchDarkly Dashboard</h2>
        <ol>
          <li>Log in to your LaunchDarkly account</li>
          <li>Navigate to the "Feature flags" section</li>
          <li>Find the flag you want to modify</li>
          <li>Toggle the flag or change its variation</li>
          <li>The changes will be applied to the application in real-time</li>
        </ol>
        
        <p>Close this window and refresh the Wellness Hub application to see the changes.</p>
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
  console.log('Cleanup tool running at http://localhost:3456/cleanup');
  
  // Open the browser to the cleanup page
  const openCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  exec(`${openCommand} http://localhost:3456/cleanup`, (error) => {
    if (error) {
      console.error('Error opening browser:', error);
    }
    
    // Keep the server running for a short time to allow the page to load
    console.log('Server will automatically close in 15 seconds...');
    setTimeout(() => {
      server.close(() => {
        console.log('Server closed');
        console.log('\nCleanup complete!');
        console.log('\nImportant: Use the LaunchDarkly dashboard to control feature flags instead of the test scripts.');
        console.log('The test scripts (test-flag-change.js, test-image-flag.js, etc.) may interfere with the LaunchDarkly functionality.');
        console.log('\nNow refresh the Wellness Hub application to use the latest flag values from LaunchDarkly.');
      });
    }, 15000);
  });
});
