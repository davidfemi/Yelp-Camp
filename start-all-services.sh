#!/bin/bash

# Master start script for all Campgrounds services

echo "🏕️  Starting The Campgrounds - All Services"
echo "=========================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Function to start service in background
start_service() {
    local name=$1
    local dir=$2
    local command=$3
    
    echo ""
    echo "📍 Starting $name..."
    cd "$dir" || exit
    eval "$command" &
    echo "✅ $name started (PID: $!)"
    cd - > /dev/null || exit
}

# Check required ports
echo ""
echo "🔍 Checking ports..."
check_port 5000 || echo "   Backend port 5000 in use"
check_port 3001 || echo "   MCP Server port 3001 in use"
check_port 3000 || echo "   Frontend port 3000 in use"

# Start Backend API
start_service "Backend API (Port 5000)" "yelpcamp-backend" "node server.js"

# Wait a moment for backend to initialize
sleep 3

# Start MCP Server
start_service "MCP Server (Port 3001)" "yelpcamp-backend/mcp-server" "npm run dev"

# Optional: Start Frontend
# Uncomment if you want to auto-start frontend
# start_service "Frontend (Port 3000)" "yelpcamp-frontend" "npm start"

echo ""
echo "=========================================="
echo "✨ All services started successfully!"
echo ""
echo "📡 Backend API:    http://localhost:5000"
echo "🔗 MCP Server:     http://localhost:3001"
echo "🌐 Frontend:       http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for all background processes
wait

