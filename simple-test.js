#!/usr/bin/env node

/**
 * Simple test script to verify that the application responds to flag changes
 */

console.log('Simple test script for LaunchDarkly flag changes');
console.log('------------------------------------------------');
console.log('');
console.log('Instructions:');
console.log('1. Make sure the application is running at http://localhost:3003');
console.log('2. Open the browser console (F12 or Cmd+Option+I)');
console.log('3. Run the following code in the browser console:');
console.log('');
console.log('// Get the LaunchDarkly user key from localStorage');
console.log('const ldUserKey = Object.keys(localStorage).find(key => key.startsWith("ld:"));');
console.log('');
console.log('// If no key is found, create a new one');
console.log('if (!ldUserKey) {');
console.log('  console.log("No LaunchDarkly user key found. Creating a new one...");');
console.log('  const newLdData = {');
console.log('    features: {');
console.log('      "service-sort-experiment": {');
console.log('        value: "variation_2",');
console.log('        version: 1,');
console.log('        variation: 0,');
console.log('        trackEvents: true');
console.log('      },');
console.log('      "provider-image-flag": {');
console.log('        value: "standard",');
console.log('        version: 1,');
console.log('        variation: 0,');
console.log('        trackEvents: true');
console.log('      }');
console.log('    }');
console.log('  };');
console.log('  localStorage.setItem("ld:anonymous-user", JSON.stringify(newLdData));');
console.log('  console.log("Created new LaunchDarkly entry in localStorage");');
console.log('} else {');
console.log('  // Update the existing key');
console.log('  console.log("Found LaunchDarkly user key:", ldUserKey);');
console.log('  const ldData = JSON.parse(localStorage.getItem(ldUserKey));');
console.log('  ');
console.log('  // Update the service-sort-experiment flag');
console.log('  if (ldData && ldData.features) {');
console.log('    ldData.features["service-sort-experiment"] = {');
console.log('      value: "variation_2",');
console.log('      version: ldData.features["service-sort-experiment"]?.version + 1 || 1,');
console.log('      variation: 0,');
console.log('      trackEvents: true');
console.log('    };');
console.log('    ');
console.log('    // Save the updated flags back to localStorage');
console.log('    localStorage.setItem(ldUserKey, JSON.stringify(ldData));');
console.log('    console.log("Flags updated successfully!");');
console.log('  } else {');
console.log('    console.log("Error: LaunchDarkly data not found or invalid format");');
console.log('  }');
console.log('}');
console.log('');
console.log('4. Refresh the page to see the changes');
console.log('');
console.log('You should see the application update to use variation_2 (green theme)');
