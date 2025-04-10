#!/bin/bash

echo "Setting up Wellness Hub Demo..."

# Navigate to the server directory and set up Python environment
echo "Setting up Python environment..."
cd server

# Create and activate virtual environment
echo "Creating virtual environment..."
python3 -m venv my_env
source my_env/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Deactivate virtual environment
deactivate

# Navigate to the client directory and install Node.js dependencies
echo "Installing Node.js dependencies..."
cd ../client
npm install

# Copy environment files if they don't exist
if [ ! -f "../server/.env" ]; then
    echo "Creating server .env file..."
    cp ../server/.env.example ../server/.env
fi

if [ ! -f ".env" ]; then
    echo "Creating client .env file..."
    cp .env.example .env
fi

echo "Setup complete!"
echo "You can now run the demo using ./start_demo.sh"
