#!/bin/bash

# Start script for Campgrounds MCP Server

echo "🚀 Starting Campgrounds MCP Server..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if dist directory exists (for production)
if [ ! -d dist ] && [ "$NODE_ENV" = "production" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Start the server
if [ "$NODE_ENV" = "production" ]; then
    echo "▶️  Starting in production mode..."
    npm start
else
    echo "▶️  Starting in development mode..."
    npm run dev
fi

