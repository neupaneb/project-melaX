#!/bin/bash

# melaX Backend Startup Script

echo "🚀 Starting melaX Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if config.env exists
if [ ! -f "config.env" ]; then
    echo "⚠️  config.env file not found. Creating from template..."
    echo "Please update the config.env file with your actual values before starting the server."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌟 Starting server on port 3002..."
echo "📊 Health check: http://localhost:3002/health"
echo "🔗 API base URL: http://localhost:3002/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
