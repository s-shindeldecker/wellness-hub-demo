# Wellness Hub - Health & Wellness Platform Demo

A demonstration application for a health and wellness platform that connects customers to local service providers. This application simulates a website similar to MindBodyOnline, allowing users to browse wellness services, view class schedules, and create personalized accounts.

## Features

- **Browse wellness providers** - View details about local wellness centers, fitness studios, and spas
- **Explore services** - Browse services categorized by type (yoga, fitness, wellness, meditation)
- **View class schedules** - Check morning, afternoon, and evening class schedules
- **User accounts** - Create an account and log in to access personalized features
- **Personalized recommendations** - Receive service recommendations based on user preferences

## Technical Overview

This demo application consists of:

- **React frontend** - TypeScript-based client application
- **Python Flask backend** - RESTful API providing mock data
- **LaunchDarkly integration** - Feature flags and experimentation

## Getting Started

### Prerequisites

- Node.js (v14+)
- Python 3.9+
- LaunchDarkly account (optional for initial testing)

### Installation

#### Option 1: Automated Setup (Recommended)

Run the setup script to automatically install all dependencies:

```bash
./setup.sh
```

#### Option 2: Manual Setup

1. **Set up the backend**
```bash
cd server
python3 -m pip install -r requirements.txt
cp .env.example .env
```

2. **Set up the frontend**
```bash
cd client
npm install
cp .env.example .env
```

### Running the Demo

```bash
./start_demo.sh
```

This will start both the Flask backend server and the React development server. The application will be available at:

- Frontend: [http://localhost:3003](http://localhost:3003)
- Backend API: [http://localhost:5003](http://localhost:5003)
- Analytics: [http://localhost:5003/api/analytics/results](http://localhost:5003/api/analytics/results)

To stop the servers:

```bash
./stop_demo.sh
```

## Demo Scenarios

### Anonymous User Experience

1. Browse the wellness center details
2. View available services
3. Check class schedules for different times of day

### Registered User Experience

1. Create an account or log in
2. View personalized service recommendations
3. Explore user profile information

## Personalization & Experimentation

The application demonstrates personalization through:

- **User segmentation** - Different user types (fitness enthusiast, wellness seeker, etc.)
- **Content ordering** - Service categories are ordered differently based on user segments
- **Recommendations** - Personalized service recommendations based on user preferences

## Technical Implementation

- **React components** - Modular UI components for different parts of the application
- **TypeScript** - Type-safe code for better developer experience
- **Styled Components** - Component-scoped styling
- **Flask API** - RESTful endpoints providing mock data
- **LaunchDarkly SDK** - Feature flags and experimentation

## Project Structure

- `/client` - React frontend application
  - `/src` - Source code
    - `/components` - React components
    - `/services` - API service layer
- `/server` - Python Flask backend
  - `app.py` - Main Flask application
  - `mock_data.py` - Mock data for the demo

## Additional Resources

- [Quick Start Guide](./QUICK_START.md) - Quick guide to get started
- [LaunchDarkly Setup](./LAUNCHDARKLY_SETUP.md) - Guide for setting up LaunchDarkly integration
- [Analytics Guide](./ANALYTICS_GUIDE.md) - Guide for using and interpreting analytics
