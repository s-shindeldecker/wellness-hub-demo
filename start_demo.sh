#!/bin/bash

# Stop any existing servers
echo "Stopping any existing servers..."
./stop_demo.sh > /dev/null 2>&1

# Start Flask server
echo "Starting Flask server on port 5003..."
cd server
source my_env/bin/activate
python3 -m flask run --port=5003 &
FLASK_PID=$!
cd ..
# Note: We're not deactivating the virtual environment to ensure Flask has access to all installed packages

# Wait for Flask server to start
sleep 2

# Start React development server
echo "Starting React development server on port 3003..."
cd client
PORT=3003 npm start &
REACT_PID=$!
cd ..

# Save PIDs to file for stop script
echo $FLASK_PID > .flask_pid
echo $REACT_PID > .react_pid

# Wait a moment for servers to start
sleep 5

# Open the demo in the browser
echo "Opening demo in browser..."
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3003
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3003
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
  # Windows
  start http://localhost:3003
fi

echo "Demo is running!"
echo "- Frontend: http://localhost:3003"
echo "- Backend: http://localhost:5003"
echo "- Analytics: http://localhost:5003/api/analytics/results"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; ./stop_demo.sh; exit 0" INT
wait
