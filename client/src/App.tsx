import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { Container, NavBar, NavBrand, NavLinks, NavLink } from './styles';
import { Provider, User, UserRecommendations } from './types';
import { getProviders, getUser, getUserRecommendations, loginUser } from './services/api';
import { identifyUser } from './launchdarkly';
import { getUserContext, startNewSession } from './services/userIdentity';

// Import components
import ProviderDetails from './components/ProviderDetails';
import Services from './components/Services';
import ClassSchedule from './components/ClassSchedule';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import Chatbot from './components/Chatbot';

// Define tabs
type Tab = 'services' | 'schedule' | 'profile';

// The LaunchDarkly React SDK's useFlags hook automatically handles flag changes
// No custom hook needed - the SDK will re-render components when flags change

function App() {
  // State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<UserRecommendations | null>(null);

  // Get feature flags with change subscription
  const flags = useFlags();
  const ldClient = useLDClient();
  
  // Create a state for the provider-image-flag and backend variation
  const [providerImageFlag, setProviderImageFlag] = useState<string>('standard');
  const [backendVariation, setBackendVariation] = useState<string>('');
  
  // State to track when flags change to force re-renders
  const [flagChangeCount, setFlagChangeCount] = useState(0);
  
  // Add a ref to track if we've initialized from backend
  const providerImageFlagInitialized = useRef(false);

  // Define fetchProviders function to be used in multiple places
  const fetchProviders = useCallback(async () => {
    try {
      // Pass userId if available (convert null to undefined)
      const response = await getProviders(userId || undefined);
      const { providers, imageVariation } = response;
      
      // Log the image variation from the backend
      console.log('Backend image variation:', imageVariation);
      
      // Set the image variation from the backend
      if (imageVariation === 'Enhanced high-quality images') {
        console.log('Setting provider-image-flag to enhanced from backend');
        setProviderImageFlag('enhanced');
        providerImageFlagInitialized.current = true;
      } else if (imageVariation === 'Standard images') {
        console.log('Setting provider-image-flag to standard from backend');
        setProviderImageFlag('standard');
        providerImageFlagInitialized.current = true;
      } else {
        console.log('Using default standard image quality');
        setProviderImageFlag('standard');
      }
      
      // Set the providers
      setProviders(providers);
      if (providers.length > 0) {
        setSelectedProvider(providers[0]);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  }, [userId]);

  // Initial fetch of providers
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  
  // Subscribe to LaunchDarkly flag changes
  useEffect(() => {
    if (!ldClient) return;
    
    // Set up a listener for the provider-image-flag
    const flagChangeListener = (changes: any) => {
      if (changes['provider-image-flag'] !== undefined) {
        const newValue = changes['provider-image-flag'].current;
        console.log('LaunchDarkly provider-image-flag changed to:', newValue);
        
        // When a flag changes, re-fetch from the backend to ensure consistency
        fetchProviders();
        
        // Increment flag change count to force re-renders
        setFlagChangeCount(prev => prev + 1);
      }
    };
    
    // Register the listener
    ldClient.on('change', flagChangeListener);
    
    // Clean up the listener on unmount
    return () => {
      ldClient.off('change', flagChangeListener);
    };
  }, [ldClient, fetchProviders]);
  
  // Handle initial flag values and changes
  useEffect(() => {
    if (!flags) return;
    
    // Log flag values for debugging
    console.log('Current flag values:', flags);
    
    // Handle provider-image-flag
    const imageFlag = flags['provider-image-flag'];
    console.log('LaunchDarkly provider-image-flag value:', imageFlag);
    
    // Only update from client-side flags if we haven't received a backend value yet
    if (!providerImageFlagInitialized.current) {
      if (imageFlag === 'enhanced' || imageFlag === 'Enhanced high-quality images') {
        console.log('Setting provider-image-flag to enhanced from client');
        setProviderImageFlag('enhanced');
      } else if (imageFlag === 'standard' || imageFlag === 'Standard images') {
        console.log('Setting provider-image-flag to standard from client');
        setProviderImageFlag('standard');
      } else {
        console.log('Using default standard image quality');
        setProviderImageFlag('standard');
      }
    }
    
    // Force a re-render when flags change
    setFlagChangeCount(prev => prev + 1);
  }, [flags]);

  // Load user data when logged in
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const userData = await getUser(userId);
          setUser(userData);

          const recommendationsData = await getUserRecommendations(userId);
          setRecommendations(recommendationsData);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }
  }, [userId]);

  // Handle login
  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await loginUser(username, password);
      setUserId(response.userId);
      setUser(response.user);
      setIsLoggedIn(true);
      setShowLogin(false);
      
      // Update LaunchDarkly user context after login
      if (ldClient) {
        const newUserContext = getUserContext(response.userId);
        console.log('Updating LaunchDarkly user context after login:', newUserContext);
        identifyUser(ldClient, newUserContext);
        
        // Re-fetch providers with the new user context
        fetchProviders();
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserId(null);
    setRecommendations(null);
    
    // Reset LaunchDarkly user context to anonymous
    if (ldClient) {
      const anonymousContext = getUserContext();
      console.log('Resetting LaunchDarkly user context to anonymous:', anonymousContext);
      identifyUser(ldClient, anonymousContext);
      
      // Re-fetch providers with the anonymous user context
      fetchProviders();
    }
  };

  // Handle register
  const handleRegister = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // Handle provider selection
  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Render content based on active tab
  const renderContent = () => {
    if (!selectedProvider) {
      return <div>Loading...</div>;
    }

    switch (activeTab) {
      case 'services':
        return (
          <Services 
            providerId={selectedProvider.id} 
            userId={userId || undefined}
            onServiceClick={(serviceName, serviceCategory) => {
              console.log(`Selected service: ${serviceName} (${serviceCategory})`);
            }}
            key={`services-${flagChangeCount}`} // Force re-mount when flags change
            onVariationChange={(backendVar: string) => {
              console.log('Backend variation changed to:', backendVar);
              setBackendVariation(backendVar);
            }}
          />
        );
      case 'schedule':
        return <ClassSchedule providerId={selectedProvider.id} />;
      case 'profile':
        return isLoggedIn ? (
          <UserProfile 
            user={user!} 
            recommendations={recommendations!} 
          />
        ) : (
          <div className="text-center mt-4">
            <p>Please log in to view your profile</p>
            <button 
              className="btn btn-primary mt-2" 
              onClick={() => setShowLogin(true)}
            >
              Log In
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <NavBar>
        <NavBrand>WELLNESS HUB</NavBrand>
        <NavLinks>
          <NavLink 
            active={activeTab === 'services'} 
            onClick={() => handleTabChange('services')}
          >
            SERVICES
          </NavLink>
          <NavLink 
            active={activeTab === 'schedule'} 
            onClick={() => handleTabChange('schedule')}
          >
            SCHEDULE
          </NavLink>
          <NavLink 
            active={activeTab === 'profile'} 
            onClick={() => handleTabChange('profile')}
          >
            MY PROFILE
          </NavLink>
        </NavLinks>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* New Session Button for testing */}
          <button 
            className="btn btn-outline-light" 
            onClick={() => {
              // Start a new session with a new user ID
              const newSessionId = startNewSession();
              
              // Update LaunchDarkly user context
              if (ldClient) {
                const newUserContext = getUserContext();
                console.log('Starting new session with ID:', newSessionId);
                identifyUser(ldClient, newUserContext);
                
                // Re-fetch providers with the new user context
                fetchProviders();
              }
            }}
            title="Start a new session with a different user ID for testing"
          >
            New Session
          </button>
          
          {isLoggedIn ? (
            <button 
              className="btn btn-outline-light" 
              onClick={handleLogout}
            >
              Log Out
            </button>
          ) : (
            <button 
              className="btn btn-outline-light" 
              onClick={() => setShowLogin(true)}
            >
              Log In
            </button>
          )}
        </div>
      </NavBar>

      <Container>
        {selectedProvider && (
          <ProviderDetails 
            provider={selectedProvider} 
            onProviderSelect={handleProviderSelect}
            providers={providers}
            imageVariation={providerImageFlag}
            key={`provider-details-${flagChangeCount}`} // Force re-mount when flags change
          />
        )}

        {renderContent()}
      </Container>

      {showLogin && (
        <Login 
          onLogin={handleLogin} 
          onClose={() => setShowLogin(false)} 
          onRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <Register 
          onRegister={handleRegister} 
          onClose={() => setShowRegister(false)} 
        />
      )}
      
      {/* Add the Chatbot component */}
      <Chatbot />
    </div>
  );
}

export default App;
