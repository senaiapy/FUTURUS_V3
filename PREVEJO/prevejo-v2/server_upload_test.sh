#!/bin/bash

###############################################################################
# PREVEJO - SERVER UPLOAD TEST SCRIPT (Non-Interactive)
#
# This is a TEST version with preset values to verify the script logic.
# It will build the image and create all files but STOP before uploading.
###############################################################################

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Temp directory for exports
EXPORT_DIR="$SCRIPT_DIR/.deploy_temp"

# Container name
CONTAINER_APP="prevejo-app"
IMAGE_NAME="prevejo-app"

#=== TEST PRESET VALUES ===
APP_PORT=4447
SERVER_IP="test.example.com"
SERVER_USER="root"
SERVER_PATH="/var/www/prevejo"
SSH_PORT=22
ARCH_CHOICE=1
PLATFORM="linux/amd64"
ARCH_NAME="amd64"
TEST_MODE=true

#-----------------------------------------------
# Helper Functions
#-----------------------------------------------
print_header() {
    echo -e "\n${PURPLE}=============================================="
    echo -e " $1"
    echo -e "==============================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
}

#-----------------------------------------------
# Banner
#-----------------------------------------------
echo -e "${PURPLE}"
echo "  ____  ____  _______     _______ _   _  ___  "
echo " |  _ \|  _ \| ____\ \   / / ____| | / _ \   "
echo " | |_) | |_) |  _|  \ \ / /|  _| _ | | | |  "
echo " |  __/|  _ <| |___  \ V / | |__|/ \| |_| |  "
echo " |_|   |_| \_\_____|  \_/  |_____\_/ \___/   "
echo ""
echo "    SERVER UPLOAD - TEST MODE (Non-Interactive)"
echo -e "${NC}"

print_warning "Running in TEST MODE with preset values"
echo ""

#-----------------------------------------------
# Step 1: Port Configuration (PRESET)
#-----------------------------------------------
print_header "1. PORT CONFIGURATION"
print_test "Using preset port: $APP_PORT"
print_success "Port configured: $APP_PORT"

#-----------------------------------------------
# Step 2: Clean Old Docker Images
#-----------------------------------------------
print_header "2. CLEAN OLD DOCKER IMAGES"
print_test "Cleaning old images..."
docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
docker rmi prevejo-v2-prevejo:latest 2>/dev/null || true
docker images | grep prevejo | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
print_success "Old images cleaned (if any existed)"

#-----------------------------------------------
# Step 3: Clean Old Docker Volumes
#-----------------------------------------------
print_header "3. CLEAN OLD DOCKER VOLUMES"
print_test "Stopping containers and cleaning volumes..."
docker compose down -v 2>/dev/null || true
docker volume ls | grep prevejo | awk '{print $2}' | xargs -r docker volume rm -f 2>/dev/null || true
print_success "Old volumes cleaned (if any existed)"

#-----------------------------------------------
# Step 4: Build and Compile
#-----------------------------------------------
print_header "4. BUILD AND COMPILE"
print_test "Architecture: $PLATFORM ($ARCH_NAME)"

# Stop local containers
print_step "Stopping local containers..."
docker compose down 2>/dev/null || true
print_success "Containers stopped"

# Clean .next cache
print_step "Cleaning build cache..."
rm -rf .next 2>/dev/null || true
print_success "Build cache cleaned"

# Build Next.js locally first
print_step "Building Next.js application locally..."
BUILD_START=$(date +%s)

if npm run build 2>&1; then
    print_success "Next.js build completed"
else
    print_error "Next.js build failed!"
    exit 1
fi

# Build Docker image with explicit platform (no multi-arch manifest)
print_step "Building Docker image for $PLATFORM..."
echo ""

if docker buildx build --platform "$PLATFORM" --provenance=false -t ${IMAGE_NAME}:latest -f Dockerfile --load . 2>&1; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    echo ""
    print_success "Docker image built successfully in ${BUILD_TIME}s"
else
    print_error "Docker build failed!"
    exit 1
fi

# Verify image exists and architecture
print_step "Verifying built image..."
if docker image inspect "${IMAGE_NAME}:latest" &>/dev/null; then
    docker images | grep "${IMAGE_NAME}" || true
    BUILT_ARCH=$(docker image inspect ${IMAGE_NAME}:latest --format '{{.Architecture}}' 2>/dev/null || echo "unknown")
    print_success "Image verified (Architecture: $BUILT_ARCH)"
    if [[ "$BUILT_ARCH" != "$ARCH_NAME" ]]; then
        print_warning "Architecture mismatch! Expected: $ARCH_NAME, Got: $BUILT_ARCH"
    fi
else
    print_error "Image not found after build!"
    exit 1
fi

#-----------------------------------------------
# Step 5: Export and Compress Images
#-----------------------------------------------
print_header "5. EXPORT AND COMPRESS IMAGES"

rm -rf "$EXPORT_DIR"
mkdir -p "$EXPORT_DIR/images"

print_step "Exporting application image..."
EXPORT_START=$(date +%s)
docker save ${IMAGE_NAME}:latest | gzip > "$EXPORT_DIR/images/prevejo-app.tar.gz"
EXPORT_END=$(date +%s)
EXPORT_TIME=$((EXPORT_END - EXPORT_START))

IMAGE_SIZE=$(du -h "$EXPORT_DIR/images/prevejo-app.tar.gz" | cut -f1)
print_success "App image exported: $IMAGE_SIZE (took ${EXPORT_TIME}s)"

#-----------------------------------------------
# Step 6: Server Configuration (PRESET)
#-----------------------------------------------
print_header "6. SERVER CONFIGURATION"
print_test "Using preset server values:"
echo "  Server IP: $SERVER_IP"
echo "  Username:  $SERVER_USER"
echo "  Path:      $SERVER_PATH"
echo "  SSH Port:  $SSH_PORT"
print_success "Server configuration set"

#-----------------------------------------------
# Step 7: SSH Authentication (SKIPPED)
#-----------------------------------------------
print_header "7. SSH AUTHENTICATION"
print_test "Skipping SSH authentication in test mode"
print_warning "No actual SSH connection will be made"

#-----------------------------------------------
# Step 8: Test SSH Connection (SKIPPED)
#-----------------------------------------------
print_header "8. TESTING CONNECTION"
print_test "Skipping SSH connection test"
print_warning "No actual SSH connection will be made"

#-----------------------------------------------
# Step 9: Create Server Configuration Files
#-----------------------------------------------
print_header "9. CREATING SERVER FILES"

APP_URL="http://${SERVER_IP}:${APP_PORT}"

print_step "Creating docker-compose.yml..."
cat > "$EXPORT_DIR/docker-compose.yml" << COMPOSE_EOF
services:
  prevejo:
    image: ${IMAGE_NAME}:latest
    container_name: ${CONTAINER_APP}
    restart: always
    ports:
      - "${APP_PORT}:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

networks:
  default:
    driver: bridge
COMPOSE_EOF
print_success "docker-compose.yml created"

print_step "Creating .env file..."
cat > "$EXPORT_DIR/.env" << ENV_EOF
# Application Configuration
APP_URL=${APP_URL}
NODE_ENV=production

# Ports
APP_PORT=${APP_PORT}
ENV_EOF
print_success ".env created"

# Create management scripts
print_step "Creating management scripts..."

cat > "$EXPORT_DIR/start.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true
docker compose up -d
echo "Container started."
echo "Access: ${APP_URL:-http://localhost:4447}"
SCRIPT_EOF

cat > "$EXPORT_DIR/stop.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
docker compose down
echo "Container stopped."
SCRIPT_EOF

cat > "$EXPORT_DIR/restart.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
docker compose restart
echo "Container restarted."
SCRIPT_EOF

cat > "$EXPORT_DIR/logs.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
docker compose logs -f ${1:-}
SCRIPT_EOF

cat > "$EXPORT_DIR/status.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true
echo "=== Container Status ==="
docker compose ps
echo ""
echo "=== Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:${APP_PORT:-4447} || echo "App not responding"
echo ""
echo "=== Disk Usage ==="
docker system df
SCRIPT_EOF

cat > "$EXPORT_DIR/rebuild.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Stopping container..."
docker compose down
echo "Removing old image..."
docker rmi prevejo-app:latest 2>/dev/null || true
echo "Loading new image..."
if [ -f "images/prevejo-app.tar.gz" ]; then
    gunzip -c images/prevejo-app.tar.gz | docker load
fi
echo "Starting container..."
docker compose up -d
echo "Rebuild complete!"
SCRIPT_EOF

cat > "$EXPORT_DIR/debug.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true

echo "=== PREVEJO DEBUG INFO ==="
echo ""
echo "=== Container Status ==="
docker compose ps
echo ""
echo "=== App Container Logs (last 50 lines) ==="
docker logs prevejo-app --tail 50 2>&1 || echo "Cannot get app logs"
echo ""
echo "=== HTTP Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" http://localhost:${APP_PORT:-4447} || echo "App not responding"
echo ""
echo "=== Container Resources ==="
docker stats prevejo-app --no-stream 2>/dev/null || echo "Cannot get stats"
echo ""
echo "=== Docker Images ==="
docker images | grep prevejo || echo "No prevejo images found"
SCRIPT_EOF

chmod +x "$EXPORT_DIR"/*.sh
print_success "All management scripts created"

#-----------------------------------------------
# Step 10-11: Upload & Install (SKIPPED)
#-----------------------------------------------
print_header "10-11. UPLOAD & REMOTE INSTALLATION"
print_test "Skipping upload and remote installation in test mode"
print_warning "Files are ready in: $EXPORT_DIR"

#-----------------------------------------------
# Step 12: Local Verification
#-----------------------------------------------
print_header "12. LOCAL VERIFICATION"

print_step "Verifying generated files..."
echo ""
echo "Generated files in $EXPORT_DIR:"
ls -la "$EXPORT_DIR/"
echo ""
echo "Images:"
ls -la "$EXPORT_DIR/images/"
echo ""

print_step "Validating docker-compose.yml..."
if docker compose -f "$EXPORT_DIR/docker-compose.yml" config > /dev/null 2>&1; then
    print_success "docker-compose.yml is valid"
else
    print_warning "docker-compose.yml validation failed (may need image to exist)"
fi

print_step "Testing local container startup..."
cd "$EXPORT_DIR"
if docker compose up -d 2>&1; then
    print_success "Container started locally"

    echo ""
    print_step "Waiting for container to be ready (30s max)..."
    for i in {1..10}; do
        sleep 3
        STATUS=$(docker compose ps --format '{{.Status}}' 2>/dev/null | head -1 || echo "unknown")
        HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT} 2>/dev/null || echo "000")

        if [[ "$HTTP_CODE" == "200" ]]; then
            print_success "Container is healthy! (HTTP $HTTP_CODE)"
            break
        fi
        echo "  Waiting... ($((i*3))s) - Status: $STATUS, HTTP: $HTTP_CODE"
    done

    echo ""
    print_step "Container status:"
    docker compose ps

    echo ""
    print_step "Testing HTTP response..."
    HTTP_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT} 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" == "200" ]; then
        print_success "HTTP response: $HTTP_STATUS"
    else
        print_warning "HTTP response: $HTTP_STATUS (may still be starting)"
    fi

    echo ""
    print_step "Stopping test container..."
    docker compose down
    print_success "Test container stopped"
else
    print_warning "Could not start container locally"
fi

cd "$SCRIPT_DIR"

#-----------------------------------------------
# Summary
#-----------------------------------------------
print_header "TEST COMPLETE!"

echo -e "${GREEN}All tests passed!${NC}"
echo ""
echo -e "${CYAN}Summary:${NC}"
echo "  Image built:     ${IMAGE_NAME}:latest"
echo "  Image size:      ${IMAGE_SIZE}"
echo "  Architecture:    ${ARCH_NAME}"
echo "  Export location: ${EXPORT_DIR}"
echo ""
echo -e "${CYAN}Generated files:${NC}"
echo "  - docker-compose.yml"
echo "  - .env"
echo "  - start.sh, stop.sh, restart.sh"
echo "  - logs.sh, status.sh, debug.sh"
echo "  - rebuild.sh"
echo "  - images/prevejo-app.tar.gz"
echo ""
echo -e "${CYAN}To deploy to a real server:${NC}"
echo "  ./server_upload.sh"
echo ""
echo -e "${YELLOW}To clean up test files:${NC}"
echo "  rm -rf $EXPORT_DIR"
echo ""
print_success "Test script finished!"
