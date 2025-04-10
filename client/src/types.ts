// Provider types
export interface Provider {
  id: string;
  name: string;
  address: string;
  rating: number;
  specialties: string[];
  image: string;
}

// Service types
export interface Service {
  name: string;
  duration: string;
  price: string;
}

export interface ServicesByCategory {
  [category: string]: Service[];
}

export interface ServicesResponse {
  services: ServicesByCategory;
  variation: string;
}

// Schedule types
export interface ClassScheduleItem {
  time: string;
  class: string;
  instructor: string;
  spots: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

// User types
export interface UserPreferences {
  favorite_activities: string[];
  preferred_times: string[];
  notifications: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  segment: string;
  preferences: UserPreferences;
}

export interface UserLoginResponse {
  status: string;
  userId: string;
  user: User;
}

export interface UserRegistrationResponse {
  status: string;
  userId: string;
}

// Recommendations types
export interface UserRecommendations {
  interests: string[];
  recommended_services: string[];
  recommended_providers: string[];
}

// Analytics types
export interface AnalyticsEvent {
  type: string;
  userId: string;
  variation?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

export interface VariationStats {
  clicks: number;
  views: number;
  ctr: number;
}

export interface AnalyticsResults {
  [variation: string]: VariationStats;
}
