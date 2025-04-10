import styled from 'styled-components';

// Common styles
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

export const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

export const Button = styled.button`
  background-color: #0080ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0066cc;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;

  &:hover {
    background-color: #e0e0e0;
  }
`;

export const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

export const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

// Form styles
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 500px;
  margin: 0 auto;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 10px;
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

export const ErrorMessage = styled.div`
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 5px;
`;

// Navigation styles
export const NavBar = styled.nav`
  background-color: #222;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

export const NavBrand = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #0080ff;
`;

export const NavLinks = styled.div`
  display: flex;
  gap: 20px;
`;

export const NavLink = styled.a<{ active?: boolean }>`
  color: ${props => props.active ? '#0080ff' : 'white'};
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    color: #0080ff;
  }
`;

// Provider styles
export const ProviderCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

export const ProviderImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
  margin-bottom: 15px;
`;

export const ProviderName = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 10px 0;
`;

export const ProviderAddress = styled.p`
  color: #666;
  margin: 0 0 10px 0;
`;

export const ProviderRating = styled.div`
  color: #0080ff;
  font-weight: bold;
  margin-bottom: 10px;
`;

export const ProviderSpecialties = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 15px;
`;

export const SpecialtyTag = styled.span`
  background-color: #f0f0f0;
  color: #333;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
`;

// Category styles
export const CategorySection = styled.div`
  margin-bottom: 2rem;
`;

export const CategoryTitle = styled.h2`
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
  text-transform: capitalize;
`;

// Service styles
export const ServiceCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 1.2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ServiceName = styled.h3`
  margin: 0 0 0.5rem;
  color: #0080ff;
  font-size: 1.2rem;
`;

export const ServiceDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.8rem;
  color: #666;
  font-size: 0.9rem;
`;

export const ServiceDuration = styled.span``;

export const ServicePrice = styled.span`
  font-weight: bold;
  color: #333;
`;

// Schedule styles
export const ScheduleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
`;

export const ScheduleHeader = styled.th`
  text-align: left;
  padding: 12px;
  background-color: #f0f0f0;
  border-bottom: 2px solid #ddd;
`;

export const ScheduleRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

export const ScheduleCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

export const ScheduleTime = styled.span`
  font-weight: bold;
`;

export const ScheduleSpots = styled.span<{ available: boolean }>`
  color: ${props => props.available ? '#00a651' : '#d32f2f'};
  font-weight: ${props => props.available ? 'normal' : 'bold'};
`;

// User profile styles
export const ProfileSection = styled.section`
  margin-bottom: 2rem;
`;

export const ProfileInfo = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 10px;
  margin-bottom: 1rem;
`;

export const ProfileLabel = styled.div`
  font-weight: bold;
  color: #666;
`;

export const ProfileValue = styled.div`
  color: #333;
`;

export const RecommendationList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

export const RecommendationItem = styled.li`
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

// Tab styles
export const TabContainer = styled.div`
  margin-bottom: 2rem;
`;

export const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
`;

export const Tab = styled.div<{ active: boolean }>`
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: ${props => props.active ? '2px solid #0080ff' : 'none'};
  color: ${props => props.active ? '#0080ff' : '#333'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: #0080ff;
  }
`;

export const TabContent = styled.div`
  padding: 1rem 0;
`;
