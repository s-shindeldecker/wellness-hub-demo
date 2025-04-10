// Generate a UUID for anonymous users
const generateAnonymousId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// In-memory storage for the current session ID
// This will be reset when the page is refreshed
let currentSessionId: string | null = null;

// Get or create anonymous user ID for the current session
export const getAnonymousUserId = (): string => {
  // If we don't have a session ID yet, generate one
  if (!currentSessionId) {
    currentSessionId = generateAnonymousId();
    console.log('Generated new session ID:', currentSessionId);
  }
  
  return currentSessionId;
};

// Force a new session with a new anonymous ID
// This can be called manually to test different user conditions
export const startNewSession = (): string => {
  currentSessionId = generateAnonymousId();
  console.log('Started new session with ID:', currentSessionId);
  return currentSessionId;
};

// Get current user context for LaunchDarkly
export const getUserContext = (userId?: string | null): any => {
  if (userId) {
    // Logged-in user
    return {
      kind: 'user',
      key: userId,
      anonymous: false,
      custom: {
        platform: 'web'
      }
    };
  } else {
    // Anonymous user
    const anonymousId = getAnonymousUserId();
    return {
      kind: 'user',
      key: anonymousId,
      anonymous: true,
      custom: {
        platform: 'web'
      }
    };
  }
};
