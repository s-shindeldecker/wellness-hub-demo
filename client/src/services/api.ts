import axios from 'axios';
import {
  Provider,
  ServicesResponse,
  ClassScheduleItem,
  User,
  UserLoginResponse,
  UserRegistrationResponse,
  UserRecommendations,
  AnalyticsResults,
  TimeOfDay
} from '../types';
import { getAnonymousUserId } from './userIdentity';

// Get API URL from environment variable or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Provider API calls
export const getProviders = async (userId?: string): Promise<{providers: Provider[], imageVariation: string}> => {
  // Use userId if provided, otherwise use anonymous ID
  const contextId = userId || getAnonymousUserId();
  const response = await api.get('/providers', { 
    params: { userId: contextId }
  });
  return response.data;
};

export const getProvider = async (providerId: string): Promise<Provider> => {
  const response = await api.get(`/provider/${providerId}`);
  return response.data;
};

// Services API calls
export const getServices = async (providerId: string, userId?: string): Promise<ServicesResponse> => {
  // Use userId if provided, otherwise use anonymous ID
  const contextId = userId || getAnonymousUserId();
  
  console.log('Fetching services with params:', { userId: contextId });
  const response = await api.get(`/services/${providerId}`, { 
    params: { userId: contextId }
  });
  return response.data;
};

export const selectService = async (
  userId: string,
  providerId: string,
  serviceName: string,
  serviceCategory: string
): Promise<void> => {
  await api.post('/service/select', {
    userId,
    providerId,
    serviceName,
    serviceCategory
  });
};

// Schedule API calls
export const getSchedule = async (
  providerId: string,
  timePeriod?: TimeOfDay
): Promise<ClassScheduleItem[]> => {
  const params = timePeriod ? { timePeriod } : {};
  const response = await api.get(`/schedule/${providerId}`, { params });
  return response.data;
};

// User API calls
export const loginUser = async (username: string, password: string): Promise<UserLoginResponse> => {
  const response = await api.post('/user/login', {
    username,
    password
  });
  return response.data;
};

export const registerUser = async (
  name: string,
  email: string,
  interests: string[],
  preferredTimes: string[],
  notifications: boolean
): Promise<UserRegistrationResponse> => {
  const response = await api.post('/user/register', {
    name,
    email,
    interests,
    preferredTimes,
    notifications
  });
  return response.data;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const getUserRecommendations = async (userId: string): Promise<UserRecommendations> => {
  const response = await api.get(`/user/${userId}/recommendations`);
  return response.data;
};

// Analytics API calls
export const trackEvent = async (
  type: string,
  userId: string,
  variation?: string,
  metadata?: Record<string, any>
): Promise<void> => {
  await api.post('/analytics/track', {
    type,
    userId,
    variation,
    metadata
  });
};

export const getAnalyticsResults = async (): Promise<AnalyticsResults> => {
  const response = await api.get('/analytics/results');
  return response.data;
};

export default api;
