# Provider Image Flag Feature

This document explains how to use the "provider-image-flag" feature in the Wellness Hub application.

## Overview

The provider-image-flag feature allows you to toggle between standard and enhanced high-quality images for wellness providers. When enabled, the enhanced mode displays:

- Higher quality images with a different color scheme
- "HD" indicator on images
- Different background styling
- An "Enhanced HD" quality indicator

## How to Use

### Using LaunchDarkly Dashboard

1. Log in to your LaunchDarkly dashboard
2. Navigate to the "Feature flags" section
3. Find or create the "provider-image-flag" feature flag
4. Configure the flag with the following variations:
   - "Standard images" (default)
   - "Enhanced high-quality images"
5. Toggle the flag to switch between these variations
6. Refresh the Wellness Hub application to see the changes

### Implementation Details

The feature is implemented in two main components:

1. **App.tsx**: Reads the LaunchDarkly flag and sets the `providerImageFlag` state
   ```typescript
   useEffect(() => {
     const imageFlag = flags['provider-image-flag'];
     if (imageFlag === 'Enhanced high-quality images') {
       setProviderImageFlag('enhanced');
     } else if (imageFlag === 'Standard images') {
       setProviderImageFlag('standard');
     }
   }, [flags]);
   ```

2. **ProviderDetails.tsx**: Uses the `imageVariation` prop to render different styles
   ```typescript
   const getEnhancedImageUrl = (originalUrl: string) => {
     if (imageVariation === 'enhanced') {
       return originalUrl.replace(
         /placehold\.co\/460x300\/([0-9a-f]{6})\/([0-9a-f]{6})/,
         'placehold.co/460x300/2c3e50/ecf0f1'
       ) + '+HD';
     }
     return originalUrl;
   };
   ```

## Testing

For testing purposes, the application currently forces the enhanced mode when the LaunchDarkly flag is undefined or has an unexpected value. This code should be removed in production:

```typescript
// TEMPORARY TESTING CODE - REMOVE IN PRODUCTION
console.log('TESTING: Forcing provider-image-flag to enhanced');
setProviderImageFlag('enhanced');

// PRODUCTION CODE - UNCOMMENT THIS AND REMOVE THE ABOVE CODE
// console.log('Using default standard image quality');
// setProviderImageFlag('standard');
```

## Troubleshooting

If the feature is not working as expected:

1. Check the browser console for LaunchDarkly flag values
2. Verify that the LaunchDarkly client is initialized correctly
3. Ensure the flag has the exact values: "Enhanced high-quality images" or "Standard images"
4. Refresh the application after changing the flag in the LaunchDarkly dashboard
5. Clear your browser's localStorage if you've previously used the test scripts
6. Make sure your LaunchDarkly dashboard is properly configured with the correct client-side ID

### Recent Fixes

The following issues have been fixed:

1. Removed the `bootstrap: 'localStorage'` option from the LaunchDarkly provider configuration in `index.tsx`. This ensures the app always gets the latest flag values from the LaunchDarkly server instead of using potentially outdated values from localStorage.

2. Added additional code to force a re-render when the flag changes, ensuring the UI updates immediately.

3. Set a consistent default behavior to use 'standard' image quality when the flag is undefined or has an unexpected value.
