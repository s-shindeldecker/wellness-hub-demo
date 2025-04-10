import { LDClient, initialize, LDFlagChangeset } from 'launchdarkly-react-client-sdk';

// Initialize LaunchDarkly client
const initLDClient = (clientSideID: string, user: any): LDClient => {
  const client = initialize(clientSideID, user);
  
  // Wait for client to be ready
  client.on('ready', () => {
    console.log('LaunchDarkly client initialized and ready');
    console.log('Current flags:', client.allFlags());
  });
  
  // Handle any errors
  client.on('error', (error: Error) => {
    console.error('LaunchDarkly error:', error);
  });
  
  // Set up change listener for real-time flag updates
  client.on('change', (changes: LDFlagChangeset) => {
    console.log('Flag changes detected:', changes);
    
    // Log each changed flag
    Object.keys(changes).forEach(flagKey => {
      const change = changes[flagKey];
      console.log(`Flag ${flagKey} changed from ${change.previous} to ${change.current}`);
    });
    
    // The React SDK will automatically update components using useFlags()
  });
  
  // Set up connection status listener
  client.on('connection', (status) => {
    console.log('LaunchDarkly connection status:', status);
  });
  
  return client;
};

// Create a user context for LaunchDarkly
const createLDUser = (userId: string, userAttributes?: Record<string, any>) => {
  return {
    key: userId,
    anonymous: !userId || userId === 'anonymous',
    custom: userAttributes || {}
  };
};

// Track custom events
const trackEvent = (client: LDClient, eventName: string, data?: any) => {
  client.track(eventName, data);
};

// Identify a user to LaunchDarkly (useful for changing user context)
const identifyUser = (client: LDClient, user: any) => {
  console.log('Identifying user to LaunchDarkly:', user);
  return client.identify(user);
};

export { initLDClient, createLDUser, trackEvent, identifyUser };
