# Wellness Hub Quick Start Guide

This guide will help you get the Wellness Hub demo up and running quickly.

## Prerequisites

- Node.js (v14+)
- Python 3.9+
- npm or yarn

## Setup

### Option 1: Quick Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd wellness-hub-demo

# Run the setup script to install all dependencies
./setup.sh
```

### Option 2: Manual Setup

```bash
# Clone the repository
git clone <repository-url>
cd wellness-hub-demo

# Set up the backend
cd server
python3 -m pip install -r requirements.txt
cp .env.example .env  # Edit .env if needed

# Create a virtual environment (optional but recommended)
python3 -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate

# Set up the frontend
cd ../client
npm install
cp .env.example .env  # Edit .env if needed
```

## Running the Demo

### Option 1: Using the Convenience Scripts

From the root directory:

```bash
# Start both frontend and backend
./start_demo.sh

# Stop both servers when done
./stop_demo.sh
```

### Option 2: Running Servers Separately

#### Backend Server

```bash
cd server
python3 -m flask run --port=5003
```

#### Frontend Server

```bash
cd client
PORT=3003 npm start
```

## Accessing the Demo

- Frontend: [http://localhost:3003](http://localhost:3003)
- Backend API: [http://localhost:5003/api](http://localhost:5003/api)
- Analytics: [http://localhost:5003/api/analytics/results](http://localhost:5003/api/analytics/results)

## Demo Accounts

For testing purposes, you can use these pre-configured accounts:

- **Fitness Enthusiast**: alex@example.com
- **Wellness Seeker**: jamie@example.com
- **Stress Relief**: taylor@example.com
- **New to Wellness**: jordan@example.com

Any password will work for these accounts.

## Key Features to Try

1. **Browse wellness providers** - View details about local wellness centers
2. **Explore services** - Browse services categorized by type
3. **View class schedules** - Check morning, afternoon, and evening class schedules
4. **Create an account** - Register as a new user
5. **Log in** - Access personalized features
6. **View personalized recommendations** - See recommendations based on your user segment

## Troubleshooting

- If you encounter CORS issues, ensure both servers are running
- If the frontend can't connect to the backend, check that the API URL in `.env` is correct
- For any Python dependency issues, ensure you're using Python 3.9+

## Next Steps

For more detailed information, check out:

- [Full Documentation](./README.md)
- [LaunchDarkly Setup Guide](./LAUNCHDARKLY_SETUP.md)
- [Analytics Guide](./ANALYTICS_GUIDE.md)
