#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---
TARGET_URL="${TARGET_URL:-http://localhost:3001/backend/api/v1/pods}"
CLUSTER_URL="${CLUSTER_URL:-https://127.0.0.1:52319}"
K8S_TOKEN="${K8S_TOKEN:-}"
CONCURRENCY="${CONCURRENCY:-10}"
DURATION="${DURATION:-30s}"
RESULTS_DIR="./perf-results"

mkdir -p "$RESULTS_DIR"

echo "Starting Busola backend performance test..."
echo "Target URL: $TARGET_URL"
echo "Cluster URL: $CLUSTER_URL"
echo "Duration: $DURATION, Concurrency: $CONCURRENCY"
echo "Results directory: $RESULTS_DIR"

# Start Busola backend
echo "Starting Busola backend (with TLS disabled and k3s CA trusted)..."

npx clinic doctor --on-port 'echo "Backend is running on port 3001..."' -- npm run start:backend &
BACKEND_PID=$!

# Wait for backend to initialize
sleep 8

# Run Fortio test
echo "Running Fortio load test..."
fortio load -qps -1 -t "$DURATION" -c "$CONCURRENCY" \
  -H "x-cluster-url: $CLUSTER_URL" \
  -H "x-k8s-authorization: Bearer $K8S_TOKEN" \
  -H "referer: http://localhost:8080" \
  "$TARGET_URL" | tee "$RESULTS_DIR/fortio_output.txt"

# Save Fortio metrics
fortio load -json "$RESULTS_DIR/fortio_result.json" \
  -qps -1 -t "$DURATION" -c "$CONCURRENCY" \
  -H "x-cluster-url: $CLUSTER_URL" \
  -H "x-k8s-authorization: Bearer $K8S_TOKEN" \
  -H "referer: http://localhost:8080/cluster/busola-context/overview" \
  "$TARGET_URL"

# Stop backend and analyze Clinic data 
echo "Stopping backend..."
kill $BACKEND_PID 2>/dev/null || true
sleep 3

echo "Analyzing performance data with Clinic.js..."
npx clinic doctor --visualize-only --dest "$RESULTS_DIR"

echo "Performance test complete."
echo "Fortio results saved to: $RESULTS_DIR/fortio_output.txt and fortio_result.json"
echo "Clinic.js report saved in: $RESULTS_DIR"
