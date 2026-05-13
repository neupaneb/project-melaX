#!/bin/bash

echo "🔍 Finding and killing all Node.js server processes..."

# Kill all node server.js processes
pkill -f "node server.js" 2>/dev/null || echo "No 'node server.js' processes found"

# Kill all nodemon processes
pkill -f nodemon 2>/dev/null || echo "No nodemon processes found"

# Kill processes on common ports
for port in 3000 3001 3002 5000; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || echo "Could not kill process $pid"
    else
        echo "Port $port is free"
    fi
done

echo "✅ Cleanup complete!"
echo "You can now start your server with: npm run dev"
