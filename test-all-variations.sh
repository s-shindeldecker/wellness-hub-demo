#!/bin/bash

# This script tests all variations of the LaunchDarkly flags
# It will run the test-flag-change.js script for each variation
# and open the app in the browser to see the changes

echo "Testing all LaunchDarkly flag variations"
echo "----------------------------------------"

# Function to test a variation
test_variation() {
  local variation=$1
  echo "Setting variation to: $variation"
  node test-flag-change.js $variation
  
  # Wait for the server to close
  sleep 12
  
  # Open the app in the browser
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3003
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3003
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    start http://localhost:3003
  else
    echo "Please open http://localhost:3003 in your browser"
  fi
  
  # Wait for the user to see the changes
  echo "Press Enter to continue to the next variation..."
  read
}

# Test each variation
test_variation "variation_1"
test_variation "variation_2"
test_variation "variation_3"
test_variation "variation_4"

echo "All variations tested!"
