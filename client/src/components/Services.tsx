import React, { useState, useEffect } from 'react';
import { 
  ServiceCard, 
  ServiceName, 
  ServiceDetails, 
  ServiceDuration, 
  ServicePrice,
  SectionTitle,
  CategorySection,
  CategoryTitle
} from '../styles';
import styled from 'styled-components';
import { Service, ServicesByCategory } from '../types';
import { getServices, selectService } from '../services/api';

interface ServicesProps {
  providerId: string;
  userId?: string;
  variation?: string; // Make variation optional
  onServiceClick: (serviceName: string, serviceCategory: string) => void;
  onVariationChange?: (variation: string) => void;
}

const Services: React.FC<ServicesProps> = ({ 
  providerId, 
  userId, 
  variation,
  onServiceClick,
  onVariationChange
}) => {
  // Parse the backend variation to get the category order
  const getCategoryOrder = (variation: string): string[] => {
    if (variation.includes('[') && variation.includes(']')) {
      try {
        // Try to parse it as JSON
        const parsed = JSON.parse(variation.replace(/'/g, '"'));
        if (Array.isArray(parsed)) {
          console.log('Using category order from backend:', parsed);
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing category order:', e);
      }
    }
    
    // Default category order if parsing fails
    return ['yoga', 'fitness', 'wellness', 'meditation'];
  };

  const [services, setServices] = useState<ServicesByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to store the actual variation from the backend
  const [backendVariation, setBackendVariation] = useState<string>(variation || 'variation_1');

  // We no longer need to track frontend variation changes

  // Fetch services when provider or user changes (not dependent on frontend variation)
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log(`Fetching services from backend`);
        // Do not pass the variation to the API call
        const response = await getServices(providerId, userId);
        console.log('Services response:', response);
        setServices(response.services);
        
        // Use the variation from the backend response for UI styling
        if (response.variation) {
          console.log(`Backend variation: ${response.variation}`);
          setBackendVariation(response.variation);
          
          // Notify parent component of the variation change
          if (onVariationChange) {
            onVariationChange(response.variation);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        setLoading(false);
        console.error('Error fetching services:', err);
      }
    };

    fetchServices();
  }, [providerId, userId, onVariationChange]); // Remove variation from dependencies

  const handleServiceClick = async (serviceName: string, serviceCategory: string) => {
    if (userId) {
      try {
        await selectService(userId, providerId, serviceName, serviceCategory);
      } catch (err) {
        console.error('Error selecting service:', err);
      }
    }
    
    onServiceClick(serviceName, serviceCategory);
  };

  if (loading) {
    return <div>Loading services...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Get variation-specific styles based on the first category in the order
  const getVariationStyles = () => {
    // Parse the backend variation to get the category order
    const categoryOrder = getCategoryOrder(backendVariation);
    
    // Use the first category to determine the style
    if (categoryOrder.length > 0) {
      const firstCategory = categoryOrder[0];
      console.log('First category in order:', firstCategory);
      
      switch(firstCategory) {
        case 'wellness':
          return {
            backgroundColor: '#f0f8ff', // Light blue
            headerColor: '#0080ff',
            borderColor: '#0080ff'
          };
        case 'fitness':
          return {
            backgroundColor: '#f0fff0', // Light green
            headerColor: '#00bf60',
            borderColor: '#00bf60'
          };
        case 'yoga':
          return {
            backgroundColor: '#fff0f8', // Light pink
            headerColor: '#e91e63',
            borderColor: '#e91e63'
          };
        case 'meditation':
          return {
            backgroundColor: '#fffff0', // Light yellow
            headerColor: '#ff9800',
            borderColor: '#ff9800'
          };
      }
    }
    
    // Default to blue for unknown variations
    return {
      backgroundColor: '#f0f8ff',
      headerColor: '#0080ff',
      borderColor: '#0080ff'
    };
  };

  const styles = getVariationStyles();

  // Styled components for variation-specific styling
  const VariationContainer = styled.div`
    background-color: ${styles.backgroundColor};
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  `;

  const VariationBadge = styled.div`
    display: inline-block;
    background-color: ${styles.headerColor};
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
    margin-bottom: 15px;
  `;

  
  // Get the category order from the backend variation
  const categoryOrder = getCategoryOrder(backendVariation);
  
  // Sort the categories based on the order from the backend
  const sortedCategories = Object.entries(services)
    .sort(([categoryA], [categoryB]) => {
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);
      return indexA - indexB;
    });
  
  console.log('Sorted categories:', sortedCategories.map(([category]) => category));

  return (
    <VariationContainer>
      <SectionTitle style={{ color: styles.headerColor }}>Available Services</SectionTitle>
      <VariationBadge>Variation based on: {getCategoryOrder(backendVariation)[0] || 'unknown'}</VariationBadge>
      
      {sortedCategories.map(([category, categoryServices]) => (
        <CategorySection key={category}>
          <CategoryTitle style={{ color: styles.headerColor }}>{category.toUpperCase()}</CategoryTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {categoryServices.map(service => (
              <ServiceCard 
                key={service.name} 
                onClick={() => handleServiceClick(service.name, category)}
                style={{ borderColor: styles.borderColor }}
              >
                <ServiceName style={{ color: styles.headerColor }}>{service.name}</ServiceName>
                <ServiceDetails>
                  <ServiceDuration>{service.duration}</ServiceDuration>
                  <ServicePrice>{service.price}</ServicePrice>
                </ServiceDetails>
              </ServiceCard>
            ))}
          </div>
        </CategorySection>
      ))}
      
      <div style={{ fontSize: '0.9rem', color: styles.headerColor, marginTop: '2rem', fontWeight: 'bold' }}>
        Showing services sorted by: {backendVariation}
      </div>
    </VariationContainer>
  );
};

export default Services;
