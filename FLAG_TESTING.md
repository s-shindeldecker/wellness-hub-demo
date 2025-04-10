# LaunchDarkly Flag Testing

This document explains how to test LaunchDarkly flag changes in the Wellness Hub application.

## Overview

The Wellness Hub application uses LaunchDarkly for feature flagging. The application is configured to respond to flag changes in real-time, without requiring a page refresh.

## Testing Flag Changes

There are two scripts provided to help test flag changes:

1. `test-flag-change.js` - A Node.js script that simulates a LaunchDarkly flag change
2. `test-all-variations.sh` - A shell script that tests all variations of the flags

### Using test-flag-change.js

This script updates the LaunchDarkly flags in the browser's localStorage, simulating a flag change from the LaunchDarkly dashboard.

```bash
# Usage
node test-flag-change.js [variation]

# Examples
node test-flag-change.js variation_1
node test-flag-change.js variation_2
node test-flag-change.js variation_3
node test-flag-change.js variation_4
```

When you run this script:
1. It starts a local server on port 3456
2. Opens a browser page that updates the LaunchDarkly flags in localStorage
3. After 10 seconds, the server automatically closes

After running the script, refresh the Wellness Hub application to see the changes.

### Using test-all-variations.sh

This script automates testing all variations of the flags.

```bash
# Usage
./test-all-variations.sh
```

When you run this script:
1. It tests each variation one by one
2. For each variation, it:
   - Runs the test-flag-change.js script
   - Opens the Wellness Hub application in the browser
   - Waits for you to press Enter before continuing to the next variation

## Flag Variations

The application has the following flag variations:

1. `variation_1` - Blue theme
2. `variation_2` - Green theme
3. `variation_3` - Pink theme (also changes image quality to "Enhanced HD")
4. `variation_4` - Yellow theme

## How It Works

When a flag value changes (either from LaunchDarkly or our test scripts):
1. The LaunchDarkly client detects the change
2. The useFlags() hook in App.tsx updates with the new flag values
3. The effect hook in App.tsx detects the flag change and forces a re-render
4. The Services component re-fetches data from the backend with the new variation
5. The UI updates to reflect the new variation (both styling and content order)

This implementation ensures that the application responds to flag changes in real-time, without requiring a page refresh.
