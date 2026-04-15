#!/bin/bash
# Script to build and start the Solana Docker environment

# Get the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🚀 Starting Solana Docker Tooling..."
docker compose -f docker-compose.solana.yml up -d --build

echo "✅ Container is running in the background."
echo "👉 Run ./enter-docker.sh to access the shell."
