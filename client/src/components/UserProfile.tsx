import React from 'react';
import { 
  ProfileSection, 
  ProfileInfo, 
  ProfileLabel, 
  ProfileValue,
  RecommendationList,
  RecommendationItem,
  SectionTitle
} from '../styles';
import { User, UserRecommendations } from '../types';

interface UserProfileProps {
  user: User;
  recommendations: UserRecommendations;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, recommendations }) => {
  return (
    <div>
      <SectionTitle>Your Profile</SectionTitle>
      
      <ProfileSection>
        <h3>Personal Information</h3>
        <ProfileInfo>
          <ProfileLabel>Name</ProfileLabel>
          <ProfileValue>{user.name}</ProfileValue>
        </ProfileInfo>
        <ProfileInfo>
          <ProfileLabel>Email</ProfileLabel>
          <ProfileValue>{user.email}</ProfileValue>
        </ProfileInfo>
        <ProfileInfo>
          <ProfileLabel>Member Type</ProfileLabel>
          <ProfileValue>
            {user.segment === 'fitness_enthusiast' && 'Fitness Enthusiast'}
            {user.segment === 'wellness_seeker' && 'Wellness Seeker'}
            {user.segment === 'stress_relief' && 'Stress Relief'}
            {user.segment === 'new_to_wellness' && 'New to Wellness'}
          </ProfileValue>
        </ProfileInfo>
      </ProfileSection>
      
      <ProfileSection>
        <h3>Preferences</h3>
        <ProfileInfo>
          <ProfileLabel>Interests</ProfileLabel>
          <ProfileValue>
            {user.preferences.favorite_activities.join(', ')}
          </ProfileValue>
        </ProfileInfo>
        <ProfileInfo>
          <ProfileLabel>Preferred Times</ProfileLabel>
          <ProfileValue>
            {user.preferences.preferred_times.map(time => {
              switch(time) {
                case 'morning': return 'Morning (6am - 12pm)';
                case 'afternoon': return 'Afternoon (12pm - 5pm)';
                case 'evening': return 'Evening (5pm - 10pm)';
                default: return time;
              }
            }).join(', ')}
          </ProfileValue>
        </ProfileInfo>
        <ProfileInfo>
          <ProfileLabel>Notifications</ProfileLabel>
          <ProfileValue>
            {user.preferences.notifications ? 'Enabled' : 'Disabled'}
          </ProfileValue>
        </ProfileInfo>
      </ProfileSection>
      
      <ProfileSection>
        <h3>Recommended for You</h3>
        <h4>Services</h4>
        <RecommendationList>
          {recommendations.recommended_services.map(service => (
            <RecommendationItem key={service}>
              {service}
            </RecommendationItem>
          ))}
        </RecommendationList>
        
        <h4 style={{ marginTop: '1rem' }}>Providers</h4>
        <RecommendationList>
          {recommendations.recommended_providers.map(provider => (
            <RecommendationItem key={provider}>
              {provider}
            </RecommendationItem>
          ))}
        </RecommendationList>
      </ProfileSection>
      
      <ProfileSection>
        <h3>Account Settings</h3>
        <button 
          style={{
            background: 'none',
            border: 'none',
            color: '#0080ff',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontSize: '1rem',
            marginRight: '1rem'
          }}
        >
          Edit Profile
        </button>
        <button 
          style={{
            background: 'none',
            border: 'none',
            color: '#0080ff',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            fontSize: '1rem'
          }}
        >
          Change Password
        </button>
      </ProfileSection>
    </div>
  );
};

export default UserProfile;
