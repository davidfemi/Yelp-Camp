#!/bin/bash

echo "🏕️  Setting up CampgroundsMobile Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI globally..."
    npm install -g @expo/cli
fi

# Generate native projects
echo "🔧 Generating native projects..."
npx expo prebuild --clean

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate native projects"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo ""
echo "For iOS:"
echo "  npx expo run:ios"
echo ""
echo "For Android:"
echo "  npx expo run:android"
echo ""
echo "For development server only:"
echo "  npx expo start --dev-client"
echo ""
echo "Note: You need to have the development build installed on your device/simulator"
echo "before running 'expo start --dev-client'"
