#!/bin/bash
set -e

# Resolve base paths
BACKEND_DIR="${BACKEND_DIR:-$(pwd)/backend}"
TEST_FILE="$BACKEND_DIR/tests/k6/backend-test.js"
PORT=3001
BASE_URL="http://localhost:$PORT"

echo "Building backend..."
echo "📁 Backend directory: $BACKEND_DIR"
cd "$BACKEND_DIR"
npm run build

echo "Starting Clinic profiling..."
clinic doctor -- node backend-production.js &
SERVER_PID=$!

# Wait for backend to become ready
echo "⏳ Waiting for backend to start on port $PORT..."
for i in {1..60}; do
  if curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/backend" | grep -q "200"; then
    echo "✅ Backend is up!"
    break
  else
    sleep 1
  fi

  if [ $i -eq 60 ]; then
    echo "❌ Backend did not start within 30 seconds."
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
done

echo "🏋️‍♂️ Running k6 load test against $BASE_URL..."
BASE_URL=$BASE_URL k6 run "$TEST_FILE" || true

echo "🛑 Stopping backend and finalizing Clinic report..."
kill $SERVER_PID 2>/dev/null || true

echo "✅ Test complete. Check the generated Clinic report (*.html)"
