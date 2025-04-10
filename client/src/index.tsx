import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import { getUserContext } from './services/userIdentity';

// We'll let LaunchDarkly handle its own localStorage entries
// This allows the LaunchDarkly dashboard to control feature flags

// Wrap the App component with LaunchDarkly provider
const LDApp = withLDProvider({
  clientSideID: process.env.REACT_APP_LAUNCHDARKLY_CLIENT_ID || 'client-side-id-123456789',
  user: getUserContext(), // Use consistent user context
  options: {
    streaming: true, // Enable streaming updates for real-time flag changes
    sendEvents: true, // Send events back to LaunchDarkly
    sendEventsOnlyForVariation: false, // Send all events, not just variations
    fetchGoals: true // Fetch goals from LaunchDarkly
  }
})(App);

// Log when the LaunchDarkly client is ready
console.log('LaunchDarkly provider initialized');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <LDApp />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
