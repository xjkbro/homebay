#!/bin/bash

echo "🚀 Starting HomeBay Dashboard with Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: No .env file found!"
    echo "   Creating .env from template..."
    cat > .env << 'EOF'
VITE_HOME_ZIP=
VITE_MEALVIEWER_SCHOOL_ID=
VITE_GOVEE_API_KEY="your-govee-api-key-here"

# Google Calendar OAuth 2.0 Configuration
# Get your Client ID from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
EOF
    echo "   ✅ Created .env file. Please update it with your API keys."
    echo ""
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker compose down 2>/dev/null

# Build and start
echo "🔨 Building and starting containers..."
docker compose up --build

# If we get here, container was stopped
echo ""
echo "✅ HomeBay Dashboard stopped."
