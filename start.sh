#!/bin/bash

# LG Chatbot Service Startup Script

echo "🚀 Starting LG Chatbot Services..."

# Check if .env files exist
if [ ! -f "./server/.env" ]; then
    echo "⚠️  Warning: server/.env not found. Copying from .env.example..."
    cp ./server/.env.example ./server/.env
    echo "📝 Please edit server/.env with your Azure credentials"
fi

if [ ! -f "./.env.local" ]; then
    echo "⚠️  Warning: .env.local not found. Copying from .env.example..."
    cp ./.env.example ./.env.local
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd server && npm install && cd ..

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Start services with PM2
echo "🔧 Starting services with PM2..."
pm2 start ecosystem.config.js

# Display service status
echo "✅ Services started successfully!"
echo ""
pm2 status

echo ""
echo "📌 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000"
echo ""
echo "📊 To view logs, use:"
echo "   pm2 logs"
echo ""
echo "🛑 To stop services, use:"
echo "   pm2 stop all"