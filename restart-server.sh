#!/bin/bash

echo "🔄 Restarting Backend Server..."

# Kill existing backend process
echo "Stopping existing backend server..."
pkill -f "node src/index.js" 2>/dev/null || true
sleep 2

# Start backend server
echo "Starting backend server..."
cd server && npm start
