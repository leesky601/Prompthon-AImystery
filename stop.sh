#!/bin/bash

echo "========================================"
echo " Stopping LG Chatbot Development Servers"
echo "========================================"
echo ""

echo "🔄 Stopping all services..."

# Kill all related processes
pkill -f "node src/index.js" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

# Force kill processes on specific ports
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:4000 | xargs kill -9 2>/dev/null || true

echo "✅ All services stopped"
echo ""
echo "========================================"
echo " All development servers have been stopped."
echo " You can now safely run ./start.sh again."
echo "========================================"
echo ""
