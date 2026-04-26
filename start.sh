#!/bin/bash
echo "🚀 Starting HomeBay Dashboard..."
npm run build

# Start preview server in background
echo "📡 Starting preview server..."
npm run preview &
SERVER_PID=$!

# Cleanup function to kill server on exit
cleanup() {
  echo "🛑 Stopping preview server..."
  kill $SERVER_PID 2>/dev/null
  exit 0
}

# Set trap to catch script exit and run cleanup
trap cleanup EXIT INT TERM

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Start Chromium in kiosk mode
echo "🌐 Launching Chromium..."
chromium --kiosk http://localhost:4173

# Cleanup will be called automatically when script exits
