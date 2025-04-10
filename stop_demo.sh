#!/bin/bash

echo "Stopping demo servers..."

# Stop Flask server
if [ -f .flask_pid ]; then
  FLASK_PID=$(cat .flask_pid)
  if ps -p $FLASK_PID > /dev/null; then
    kill $FLASK_PID
    echo "- Flask server stopped"
  else
    echo "- Flask server was not running"
  fi
  rm .flask_pid
else
  # Try to find and kill Flask server by port
  FLASK_PID=$(lsof -i:5003 -t 2>/dev/null)
  if [ ! -z "$FLASK_PID" ]; then
    kill $FLASK_PID 2>/dev/null
    echo "- Flask server stopped"
  else
    echo "- Flask server was not running"
  fi
fi

# Stop React development server
if [ -f .react_pid ]; then
  REACT_PID=$(cat .react_pid)
  if ps -p $REACT_PID > /dev/null; then
    kill $REACT_PID
    echo "- React development server stopped"
  else
    echo "- React development server was not running"
  fi
  rm .react_pid
else
  # Try to find and kill React server by port
  REACT_PID=$(lsof -i:3003 -t 2>/dev/null)
  if [ ! -z "$REACT_PID" ]; then
    kill $REACT_PID 2>/dev/null
    echo "- React development server stopped"
  else
    echo "- React development server was not running"
  fi
fi

echo "All servers stopped successfully!"
