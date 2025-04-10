# LaunchDarkly Usage Guide

This guide explains how to use LaunchDarkly with the Wellness Hub demo application.

## Overview

The Wellness Hub demo application uses LaunchDarkly for feature flags and experimentation. The application is configured to respond to flag changes in real-time, without requiring a page refresh.

## Feature Flags

The application uses the following feature flags:

1. **service-sort-experiment** - Controls the order of service categories
   - Variations: `variation_1`, `variation_2`, `variation_3`, `variation_4`
   - Each variation represents a different order of service categories

2. **provider-image-flag** - Controls the image quality of provider images
   - Variations: `standard`, `enhanced`
   - `standard` shows normal images
   - `enhanced` shows high-quality images with different styling

## Using LaunchDarkly Dashboard

To control feature flags, use the LaunchDarkly dashboard instead of the test scripts:

1. Log in to your LaunchDarkly account
2. Navigate to the "Feature flags" section
3. Find the flag you want to modify
4. Toggle the flag or change its variation
5. The changes will be applied to the application in real-time

## Cleanup Script

If you're experiencing issues with feature flags not updating, run the cleanup script:

```bash
node cleanup-launchdarkly-tests.js
```

This script will:
1. Clear any LaunchDarkly-related entries from localStorage
2. Provide instructions on how to use the LaunchDarkly dashboard

## Important Notes

- The test scripts (`test-flag-change.js`, `test-image-flag.js`, etc.) were created for development purposes and may interfere with the LaunchDarkly functionality. It's recommended to use the LaunchDarkly dashboard instead.

- The application is configured to use the LaunchDarkly client-side ID and server-side SDK key from the `.env` files. Make sure these keys are correct and associated with a valid LaunchDarkly project.

- The LaunchDarkly project should have the feature flags configured with the correct variations as described in the [LaunchDarkly Setup Guide](LAUNCHDARKLY_SETUP.md).

## Troubleshooting

If feature flags aren't working as expected:

1. Run the cleanup script to clear any localStorage entries that might be interfering with LaunchDarkly
2. Check the browser console for any LaunchDarkly-related errors
3. Verify that the LaunchDarkly client-side ID and server-side SDK key are correct in the `.env` files
4. Ensure the LaunchDarkly project has the feature flags configured with the correct variations
5. Restart the application using `./stop_demo.sh && ./start_demo.sh`
