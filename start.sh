#!/bin/bash

echo "========================================"
echo " LG Chatbot Development Mode (macOS/Linux)"
echo "========================================"
echo ""
echo "This will open two terminals:"
echo "  1. Backend API Server (Port 4000)"
echo "  2. Frontend Dev Server (Port 3000)"
echo ""
echo "Press Ctrl+C in each terminal to stop."
echo "========================================"
echo ""

# Kill existing processes
echo "🔄 Stopping existing servers..."
pkill -f "node src/index.js" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Check if .env files exist
if [ ! -f "./server/.env" ]; then
    echo "⚠️  Warning: server/.env not found. Copying from .env.example..."
    cp ./server/.env.example ./server/.env
    echo "📝 Please edit server/.env with your Azure credentials before continuing."
    read -p "Press Enter to continue..."
fi

if [ ! -f "./.env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Copying from .env.example..."
    cp ./.env.example ./.env.local
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd server && npm install && cd ..

# Start Backend in new terminal
echo "🚀 Starting Backend API Server..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"'/server && npm start"' 2>/dev/null || \
gnome-terminal -- bash -c "cd '$(pwd)'/server && npm start; exec bash" 2>/dev/null || \
xterm -e "cd '$(pwd)'/server && npm start" 2>/dev/null || \
echo "Please manually open a terminal and run: cd server && npm start"

# Wait a moment for backend to start
sleep 3

# Start Frontend in new terminal
echo "🚀 Starting Frontend Dev Server..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm run dev"' 2>/dev/null || \
gnome-terminal -- bash -c "cd '$(pwd)' && npm run dev; exec bash" 2>/dev/null || \
xterm -e "cd '$(pwd)' && npm run dev" 2>/dev/null || \
echo "Please manually open a terminal and run: npm run dev"

# Wait a moment for frontend to start
sleep 3

# Start ngrok in new terminal
echo "🌐 Starting ngrok tunnel..."
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && ngrok http 3000 --domain=unexpeditious-tricia-unblenchingly.ngrok-free.app"' 2>/dev/null || \
gnome-terminal -- bash -c "cd '$(pwd)' && ngrok http 3000 --domain=unexpeditious-tricia-unblenchingly.ngrok-free.app; exec bash" 2>/dev/null || \
xterm -e "cd '$(pwd)' && ngrok http 3000 --domain=unexpeditious-tricia-unblenchingly.ngrok-free.app" 2>/dev/null || \
echo "Please manually open a terminal and run: ngrok http 3000 --domain=unexpeditious-tricia-unblenchingly.ngrok-free.app"

echo ""
echo "========================================"
echo " Development servers are starting..."
echo ""
echo " Backend API: http://localhost:4000"
echo " Frontend: http://localhost:3000"
echo " ngrok URL: https://unexpeditious-tricia-unblenchingly.ngrok-free.app/"
echo ""
echo " All services are running in separate windows."
echo " Close those windows to stop the services."
echo "========================================"
echo ""