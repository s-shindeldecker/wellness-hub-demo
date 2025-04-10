import React, { useMemo } from 'react';
import { 
  ProviderCard, 
  ProviderImage, 
  ProviderName, 
  ProviderAddress, 
  ProviderRating, 
  ProviderSpecialties, 
  SpecialtyTag,
  FlexContainer,
  SectionTitle
} from '../styles';
import { Provider } from '../types';

interface ProviderDetailsProps {
  provider: Provider;
  providers: Provider[];
  onProviderSelect: (provider: Provider) => void;
  imageVariation: string;
}

const ProviderDetails: React.FC<ProviderDetailsProps> = ({ 
  provider, 
  providers, 
  onProviderSelect,
  imageVariation
}) => {
  // Debug the imageVariation prop
  console.log('ProviderDetails imageVariation:', imageVariation);
  // Function to get image URL based on the provider ID and variation
  const getEnhancedImageUrl = (originalUrl: string, providerId: string) => {
    // Map provider IDs to their enhanced image paths
    const enhancedImageMap: Record<string, string> = {
      'wellness-center-1': '/images/enhanced/harmony-wellness-hd.jpg',
      'fitness-studio-1': '/images/enhanced/elevate-fitness-hd.jpg',
      'spa-retreat-1': '/images/enhanced/tranquil-spa-hd.jpg'
    };
    
    // For enhanced images, use the actual image files
    if (imageVariation === 'enhanced') {
      // Return the enhanced image path if available, otherwise use the original URL
      return enhancedImageMap[providerId] || originalUrl;
    }
    
    return originalUrl;
  };
  
  // Apply image variation to all providers
  const enhancedProviders = useMemo(() => {
    return providers.map(p => ({
      ...p,
      image: getEnhancedImageUrl(p.image, p.id)
    }));
  }, [providers, imageVariation]);
  
  // Get the current provider with potentially enhanced image
  const currentProvider = useMemo(() => {
    return enhancedProviders.find(p => p.id === provider.id) || provider;
  }, [enhancedProviders, provider]);
  return (
    <div>
      <SectionTitle>Wellness Providers</SectionTitle>
      
      <div style={{ 
        backgroundColor: imageVariation === 'enhanced' ? '#f5f9fa' : 'transparent',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: imageVariation === 'enhanced' ? '#2c3e50' : '#666',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          marginBottom: '10px'
        }}>
          Image Quality: {imageVariation === 'enhanced' ? 'Enhanced HD' : 'Standard'}
        </div>
        
        <FlexContainer>
          {enhancedProviders.map((p) => (
          <ProviderCard 
            key={p.id} 
            onClick={() => onProviderSelect(p)}
            style={{ 
              width: '30%', 
              cursor: 'pointer',
              border: p.id === provider.id ? '2px solid #0080ff' : 'none'
            }}
          >
            <ProviderImage 
              src={p.image} 
              alt={p.name} 
              style={{
                boxShadow: imageVariation === 'enhanced' ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
                transform: imageVariation === 'enhanced' ? 'scale(1.02)' : 'none',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
            />
            <ProviderName>{p.name}</ProviderName>
            <ProviderAddress>{p.address}</ProviderAddress>
            <ProviderRating>{p.rating}/5</ProviderRating>
            <ProviderSpecialties>
              {p.specialties.map((specialty) => (
                <SpecialtyTag key={specialty}>{specialty}</SpecialtyTag>
              ))}
            </ProviderSpecialties>
          </ProviderCard>
          ))}
        </FlexContainer>
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        marginBottom: '2rem',
        padding: imageVariation === 'enhanced' ? '20px' : '0',
        backgroundColor: imageVariation === 'enhanced' ? '#f5f9fa' : 'transparent',
        borderRadius: '8px'
      }}>
        <h1 style={{ 
          color: imageVariation === 'enhanced' ? '#2c3e50' : 'inherit',
          fontWeight: imageVariation === 'enhanced' ? 'bold' : 'normal'
        }}>
          {currentProvider.name}
        </h1>
        <ProviderAddress>{currentProvider.address}</ProviderAddress>
        <p>
          Welcome to {currentProvider.name}, your destination for health and wellness services. 
          We offer a variety of services to help you achieve your wellness goals.
        </p>
      </div>
    </div>
  );
};

export default ProviderDetails;
