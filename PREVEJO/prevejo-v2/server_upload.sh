#!/bin/bash

###############################################################################
# PREVEJO - SERVER UPLOAD & DEPLOYMENT SCRIPT
#
# Interactive script for building, packaging, uploading, and deploying
# the Prevejo Next.js application to a remote server.
#
# Features:
# - Configurable port for the application
# - Clean old Docker images and volumes
# - Build for MacBook M1 (ARM64) or Linux AMD64
# - Compress images for transfer
# - Upload to remote server (password or SSH key)
# - Amazon EC2 support with .pem key files
# - Remote installation and verification
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

# Default values
APP_PORT=4447

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

ask_yes_no() {
    local prompt="$1"
    local default="${2:-n}"
    local response

    if [[ "$default" == "y" ]]; then
        read -p "$prompt (Y/n): " response
        response=${response:-y}
    else
        read -p "$prompt (y/N): " response
        response=${response:-n}
    fi

    [[ "$response" =~ ^[Yy]$ ]]
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
echo "       SERVER UPLOAD & DEPLOYMENT"
echo -e "${NC}"

#-----------------------------------------------
# Step 1: Port Configuration
#-----------------------------------------------
print_header "1. PORT CONFIGURATION"

read -p "Port for application [4447]: " APP_PORT
APP_PORT=${APP_PORT:-4447}

print_info "Application will run on port: $APP_PORT"

#-----------------------------------------------
# Step 2: Clean Old Docker Images
#-----------------------------------------------
print_header "2. CLEAN OLD DOCKER IMAGES"

if ask_yes_no "Do you want to erase all old Prevejo Docker images locally?"; then
    print_step "Removing old Prevejo images..."
    docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
    docker rmi prevejo-v2-prevejo:latest 2>/dev/null || true
    docker images | grep prevejo | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    print_success "Old images removed."
else
    print_info "Keeping existing images."
fi

#-----------------------------------------------
# Step 3: Clean Old Docker Volumes
#-----------------------------------------------
print_header "3. CLEAN OLD DOCKER VOLUMES"

if ask_yes_no "Do you want to erase all old Prevejo Docker volumes locally?"; then
    print_step "Stopping containers and removing volumes..."
    docker compose down -v 2>/dev/null || true
    docker volume ls | grep prevejo | awk '{print $2}' | xargs -r docker volume rm -f 2>/dev/null || true
    print_success "Old volumes removed."
else
    print_info "Keeping existing volumes."
fi

#-----------------------------------------------
# Step 4: Build and Compile
#-----------------------------------------------
print_header "4. BUILD AND COMPILE"

if ask_yes_no "Do you want to build and compile the Docker image?" "y"; then

    # Step 4.1: Architecture Selection
    print_header "4.1 ARCHITECTURE SELECTION"
    echo -e "${CYAN}Select target architecture:${NC}"
    echo "  1) Linux AMD64 (Standard servers, AWS, DigitalOcean, etc.)"
    echo "  2) MacBook M1/M2/M3 (ARM64)"
    echo ""
    read -p "Choose architecture [1]: " ARCH_CHOICE
    ARCH_CHOICE=${ARCH_CHOICE:-1}

    if [[ "$ARCH_CHOICE" == "2" ]]; then
        PLATFORM="linux/arm64"
        ARCH_NAME="arm64"
        print_info "Building for ARM64 (Apple Silicon)"
    else
        PLATFORM="linux/amd64"
        ARCH_NAME="amd64"
        print_info "Building for AMD64 (Standard x86_64)"
    fi

    # Stop local containers
    print_step "Stopping local containers..."
    docker compose down 2>/dev/null || true

    # Clean .next cache
    print_step "Cleaning build cache..."
    rm -rf .next 2>/dev/null || true

    # Build Next.js locally first
    print_step "Building Next.js application locally..."
    if npm run build 2>&1 | while read line; do
        echo "  $line"
    done; then
        print_success "Next.js build completed"
    else
        print_error "Next.js build failed!"
        exit 1
    fi

    # Build Docker image with explicit platform (no multi-arch manifest)
    print_step "Building Docker image for $PLATFORM..."

    if docker buildx build --platform "$PLATFORM" --provenance=false -t ${IMAGE_NAME}:latest -f Dockerfile --load . 2>&1 | while read line; do
        echo "  $line"
    done; then
        print_success "Docker image built successfully for $ARCH_NAME"
    else
        print_error "Docker build failed!"
        exit 1
    fi

    # Verify the image architecture
    print_step "Verifying image architecture..."
    BUILT_ARCH=$(docker image inspect ${IMAGE_NAME}:latest --format '{{.Architecture}}' 2>/dev/null || echo "unknown")
    if [[ "$BUILT_ARCH" == "$ARCH_NAME" ]] || [[ "$BUILT_ARCH" == "amd64" && "$ARCH_NAME" == "amd64" ]]; then
        print_success "Image architecture verified: $BUILT_ARCH"
    else
        print_warning "Image architecture mismatch! Expected: $ARCH_NAME, Got: $BUILT_ARCH"
        print_warning "The image may not run correctly on the target server."
    fi
else
    print_info "Skipping build step."
    ARCH_NAME="amd64"
fi

#-----------------------------------------------
# Step 5: Export and Compress Images
#-----------------------------------------------
print_header "5. EXPORT AND COMPRESS IMAGES"

if ask_yes_no "Do you want to export and compress Docker image for transfer?" "y"; then
    rm -rf "$EXPORT_DIR"
    mkdir -p "$EXPORT_DIR/images"

    print_step "Exporting application image..."
    docker save ${IMAGE_NAME}:latest | gzip > "$EXPORT_DIR/images/prevejo-app.tar.gz"
    print_success "App image exported: $(du -h "$EXPORT_DIR/images/prevejo-app.tar.gz" | cut -f1)"

    print_success "Total export size: $(du -sh "$EXPORT_DIR" | cut -f1)"
else
    print_info "Skipping image export."
fi

#-----------------------------------------------
# Step 6: Server Configuration
#-----------------------------------------------
print_header "6. SERVER CONFIGURATION"

read -p "Server IP or hostname: " SERVER_IP
if [ -z "$SERVER_IP" ]; then
    print_error "Server IP is required!"
    exit 1
fi

#-----------------------------------------------
# Step 7: SSH Authentication
#-----------------------------------------------
print_header "7. SSH AUTHENTICATION"

echo -e "${CYAN}Select authentication method:${NC}"
echo "  1) SSH Password"
echo "  2) SSH Key (Amazon EC2 / .pem file)"
echo ""
read -p "Choose method [1]: " AUTH_METHOD
AUTH_METHOD=${AUTH_METHOD:-1}

# Set default username based on auth method (ubuntu for AWS, root for others)
if [[ "$AUTH_METHOD" == "2" ]]; then
    DEFAULT_USER="ubuntu"
    print_info "Amazon EC2 detected - default user is 'ubuntu'"
else
    DEFAULT_USER="root"
fi

echo ""
read -p "SSH Username [$DEFAULT_USER]: " SERVER_USER
SERVER_USER=${SERVER_USER:-$DEFAULT_USER}

read -p "Remote installation path [/var/www/prevejo]: " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-/var/www/prevejo}

read -p "SSH Port [22]: " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

if [[ "$AUTH_METHOD" == "2" ]]; then
    IS_AMAZON=true

    # Loop until valid SSH key is provided or user stops
    while true; do
        read -p "Path to SSH key file (.pem): " SSH_KEY_PATH

        if [ ! -f "$SSH_KEY_PATH" ]; then
            print_error "SSH key file not found: $SSH_KEY_PATH"
            echo ""
            echo -e "${CYAN}Options:${NC}"
            echo "  1) Re-enter SSH key path"
            echo "  2) Stop deployment"
            echo ""
            read -p "Choose option [1]: " KEY_OPTION
            KEY_OPTION=${KEY_OPTION:-1}

            if [[ "$KEY_OPTION" == "2" ]]; then
                print_info "Deployment cancelled by user."
                exit 0
            fi
            # Continue loop to re-enter
            continue
        fi

        # Key file found, break the loop
        break
    done

    chmod 400 "$SSH_KEY_PATH"
    print_info "Using SSH key authentication"

    run_ssh() {
        ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY_PATH" -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
    }

    run_scp() {
        scp -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
    }
else
    IS_AMAZON=false
    read -sp "SSH Password: " SERVER_PASS
    echo ""

    if [ -z "$SERVER_PASS" ]; then
        print_error "SSH password is required!"
        exit 1
    fi

    if ! command -v sshpass &> /dev/null; then
        print_error "sshpass is required for password authentication."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "  Install with: brew install hudochenkov/sshpass/sshpass"
        else
            echo "  Install with: sudo apt install sshpass"
        fi
        exit 1
    fi

    print_info "Using password authentication"

    run_ssh() {
        sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
    }

    run_scp() {
        sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
    }
fi

echo ""
print_info "Target: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"

#-----------------------------------------------
# Step 8: Test SSH Connection
#-----------------------------------------------
print_header "8. TESTING CONNECTION"

print_step "Testing SSH connection..."

# Loop until connection succeeds or user stops
while true; do
    if run_ssh "echo 'Connection OK'" &>/dev/null; then
        print_success "SSH connection successful!"
        break
    else
        print_error "Cannot connect to server: ${SERVER_USER}@${SERVER_IP}:${SSH_PORT}"
        echo ""
        echo -e "${CYAN}Options:${NC}"
        echo "  1) Re-enter server configuration"
        echo "  2) Re-enter SSH authentication"
        echo "  3) Stop deployment"
        echo ""
        read -p "Choose option [1]: " CONN_OPTION
        CONN_OPTION=${CONN_OPTION:-1}

        if [[ "$CONN_OPTION" == "3" ]]; then
            print_info "Deployment cancelled by user."
            exit 0
        elif [[ "$CONN_OPTION" == "2" ]]; then
            # Re-enter SSH authentication
            print_header "RE-ENTER SSH AUTHENTICATION"
            echo -e "${CYAN}Select authentication method:${NC}"
            echo "  1) SSH Password"
            echo "  2) SSH Key (Amazon EC2 / .pem file)"
            echo ""
            read -p "Choose method [1]: " AUTH_METHOD
            AUTH_METHOD=${AUTH_METHOD:-1}

            if [[ "$AUTH_METHOD" == "2" ]]; then
                IS_AMAZON=true
                while true; do
                    read -p "Path to SSH key file (.pem): " SSH_KEY_PATH
                    if [ ! -f "$SSH_KEY_PATH" ]; then
                        print_error "SSH key file not found: $SSH_KEY_PATH"
                        if ! ask_yes_no "Try another path?"; then
                            print_info "Deployment cancelled by user."
                            exit 0
                        fi
                        continue
                    fi
                    break
                done
                chmod 400 "$SSH_KEY_PATH"
                run_ssh() {
                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -i "$SSH_KEY_PATH" -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
                }
                run_scp() {
                    scp -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
                }
            else
                IS_AMAZON=false
                read -sp "SSH Password: " SERVER_PASS
                echo ""
                run_ssh() {
                    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
                }
                run_scp() {
                    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
                }
            fi
        else
            # Re-enter server configuration
            print_header "RE-ENTER SERVER CONFIGURATION"
            read -p "Server IP or hostname [$SERVER_IP]: " NEW_SERVER_IP
            SERVER_IP=${NEW_SERVER_IP:-$SERVER_IP}

            read -p "SSH Username [$SERVER_USER]: " NEW_SERVER_USER
            SERVER_USER=${NEW_SERVER_USER:-$SERVER_USER}

            read -p "Remote installation path [$SERVER_PATH]: " NEW_SERVER_PATH
            SERVER_PATH=${NEW_SERVER_PATH:-$SERVER_PATH}

            read -p "SSH Port [$SSH_PORT]: " NEW_SSH_PORT
            SSH_PORT=${NEW_SSH_PORT:-$SSH_PORT}

            print_info "New target: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"
        fi

        print_step "Retrying SSH connection..."
    fi
done

#-----------------------------------------------
# Step 9: Create Server Configuration Files
#-----------------------------------------------
print_header "9. CREATING SERVER FILES"

# Determine APP_URL
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

print_step "Creating .env file..."
cat > "$EXPORT_DIR/.env" << ENV_EOF
# Application Configuration
APP_URL=${APP_URL}
NODE_ENV=production

# Ports
APP_PORT=${APP_PORT}
ENV_EOF

# Create management scripts
print_step "Creating management scripts..."

cat > "$EXPORT_DIR/start.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true
sudo docker compose up -d
echo "Container started."
echo "Access: ${APP_URL:-http://localhost:4447}"
SCRIPT_EOF

cat > "$EXPORT_DIR/stop.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
sudo docker compose down
echo "Container stopped."
SCRIPT_EOF

cat > "$EXPORT_DIR/restart.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
sudo docker compose restart
echo "Container restarted."
SCRIPT_EOF

cat > "$EXPORT_DIR/logs.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
sudo docker compose logs -f ${1:-}
SCRIPT_EOF

cat > "$EXPORT_DIR/status.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true
echo "=== Container Status ==="
sudo docker compose ps
echo ""
echo "=== Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:${APP_PORT:-4447} || echo "App not responding"
echo ""
echo "=== Disk Usage ==="
sudo docker system df
SCRIPT_EOF

cat > "$EXPORT_DIR/rebuild.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
echo "Stopping container..."
sudo docker compose down
echo "Removing old image..."
sudo docker rmi prevejo-app:latest 2>/dev/null || true
echo "Loading new image..."
if [ -f "images/prevejo-app.tar.gz" ]; then
    gunzip -c images/prevejo-app.tar.gz | sudo docker load
fi
echo "Starting container..."
sudo docker compose up -d
echo "Rebuild complete!"
SCRIPT_EOF

cat > "$EXPORT_DIR/debug.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true

echo "=== PREVEJO DEBUG INFO ==="
echo ""
echo "=== Container Status ==="
sudo docker compose ps
echo ""
echo "=== App Container Logs (last 50 lines) ==="
sudo docker logs prevejo-app --tail 50 2>&1 || echo "Cannot get app logs"
echo ""
echo "=== HTTP Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" http://localhost:${APP_PORT:-4447} || echo "App not responding"
echo ""
echo "=== Container Resources ==="
sudo docker stats prevejo-app --no-stream 2>/dev/null || echo "Cannot get stats"
echo ""
echo "=== Docker Images ==="
sudo docker images | grep prevejo || echo "No prevejo images found"
SCRIPT_EOF

print_success "Server files created."

#-----------------------------------------------
# Step 10: Upload to Server
#-----------------------------------------------
print_header "10. UPLOAD TO SERVER"

if ask_yes_no "Ready to upload files to $SERVER_IP. Continue?" "y"; then

    # Prepare server directory
    print_step "Preparing server directory..."
    run_ssh "
    # Try without sudo first
    if mkdir -p ${SERVER_PATH}/images ${SERVER_PATH}/backups 2>/dev/null; then
        echo 'Directories created successfully'
    else
        # Try with sudo
        echo 'Permission denied, trying with sudo...'
        sudo mkdir -p ${SERVER_PATH}/images ${SERVER_PATH}/backups
        sudo chown -R \$(whoami):\$(whoami) ${SERVER_PATH}
        echo 'Directories created with sudo'
    fi
    "

    # Check and kill processes using the application port
    print_step "Checking if port ${APP_PORT} is in use..."
    run_ssh "
    echo 'Checking port ${APP_PORT}...'
    PORT_PID=\$(lsof -t -i:${APP_PORT} 2>/dev/null || true)
    if [ -n \"\$PORT_PID\" ]; then
        echo \"Port ${APP_PORT} is in use by PID: \$PORT_PID\"
        echo 'Killing processes...'
        kill -9 \$PORT_PID 2>/dev/null || true
        sleep 1
        echo 'Port freed.'
    else
        echo 'Port ${APP_PORT} is free.'
    fi
    " || true

    # Ask about removing old volumes
    REMOVE_VOLUMES="n"
    if ask_yes_no "Do you want to remove old Docker volumes on the remote server?"; then
        REMOVE_VOLUMES="y"
        print_warning "Old volumes will be removed!"
    else
        print_info "Keeping existing volumes."
    fi

    # Stop and remove old Docker containers
    print_step "Stopping and removing old Docker containers..."
    run_ssh "
    echo 'Stopping old containers...'
    cd ${SERVER_PATH} 2>/dev/null || true
    sudo docker compose down 2>/dev/null || true
    sudo docker stop ${CONTAINER_APP} 2>/dev/null || true
    sudo docker rm -f ${CONTAINER_APP} 2>/dev/null || true

    # Stop any container using the same port
    CONTAINER_ON_PORT=\$(sudo docker ps -q --filter 'publish=${APP_PORT}' 2>/dev/null || true)
    if [ -n \"\$CONTAINER_ON_PORT\" ]; then
        echo \"Found container using port ${APP_PORT}: \$CONTAINER_ON_PORT\"
        sudo docker stop \$CONTAINER_ON_PORT 2>/dev/null || true
        sudo docker rm -f \$CONTAINER_ON_PORT 2>/dev/null || true
    fi
    echo 'Containers stopped and removed.'
    " || true

    # Remove old Docker volumes if requested
    if [[ "$REMOVE_VOLUMES" == "y" ]]; then
        print_step "Removing old Docker volumes..."
        run_ssh "
        echo 'Listing volumes...'
        sudo docker volume ls

        # Remove volumes associated with prevejo
        PREVEJO_VOLUMES=\$(sudo docker volume ls -q | grep -i prevejo 2>/dev/null || true)
        if [ -n \"\$PREVEJO_VOLUMES\" ]; then
            echo \"Removing prevejo volumes: \$PREVEJO_VOLUMES\"
            sudo docker volume rm -f \$PREVEJO_VOLUMES 2>/dev/null || true
        fi

        # Prune unused volumes
        echo 'Pruning unused volumes...'
        sudo docker volume prune -f 2>/dev/null || true
        echo 'Volumes cleaned.'
        " || true
    fi

    # Remove old Docker images
    print_step "Removing old Docker images..."
    run_ssh "
    echo 'Checking for old prevejo images...'
    OLD_IMAGES=\$(sudo docker images -q ${IMAGE_NAME} 2>/dev/null || true)
    if [ -n \"\$OLD_IMAGES\" ]; then
        echo \"Removing old images: \$OLD_IMAGES\"
        sudo docker rmi -f \$OLD_IMAGES 2>/dev/null || true
    fi

    # Also remove any dangling images
    sudo docker image prune -f 2>/dev/null || true
    echo 'Old images cleaned.'
    " || true

    # Remove old uncompressed images if they exist
    print_step "Cleaning old image files on server..."
    run_ssh "
    cd ${SERVER_PATH}/images 2>/dev/null || true
    if [ -f 'prevejo-app.tar.gz' ]; then
        echo 'Removing old image archive...'
        rm -f prevejo-app.tar.gz
    fi
    if [ -f 'prevejo-app.tar' ]; then
        echo 'Removing old uncompressed image...'
        rm -f prevejo-app.tar
    fi
    echo 'Old image files cleaned.'
    " || true

    # Upload images
    print_step "Uploading Docker image (this may take a few minutes)..."
    run_scp "$EXPORT_DIR/images/prevejo-app.tar.gz" "${SERVER_PATH}/images/"
    print_success "App image uploaded."

    # Upload configuration files
    print_step "Uploading configuration files..."
    run_scp "$EXPORT_DIR/docker-compose.yml" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/.env" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/start.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/stop.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/restart.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/logs.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/status.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/rebuild.sh" "${SERVER_PATH}/"
    run_scp "$EXPORT_DIR/debug.sh" "${SERVER_PATH}/"

    print_success "All files uploaded."
else
    print_info "Upload cancelled."
    exit 0
fi

#-----------------------------------------------
# Step 11: Remote Installation
#-----------------------------------------------
print_header "11. REMOTE INSTALLATION"

print_step "Installing Docker on server (if needed)..."
run_ssh "
if ! command -v docker &> /dev/null; then
    echo 'Installing Docker...'
    curl -fsSL https://get.docker.com | sudo sh
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker \$(whoami)
    echo 'Docker installed. User added to docker group.'
fi
echo 'Docker version:' \$(sudo docker --version)
"

print_step "Loading Docker image on server..."
run_ssh "
cd ${SERVER_PATH}

# Verify the image archive exists
if [ ! -f 'images/prevejo-app.tar.gz' ]; then
    echo 'ERROR: Image archive not found!'
    exit 1
fi

# Check file size to ensure it's valid
FILE_SIZE=\$(stat -c%s 'images/prevejo-app.tar.gz' 2>/dev/null || stat -f%z 'images/prevejo-app.tar.gz' 2>/dev/null || echo '0')
echo \"Image archive size: \$FILE_SIZE bytes\"
if [ \"\$FILE_SIZE\" -lt 1000000 ]; then
    echo 'WARNING: Image file seems too small, may be corrupted!'
fi

# Remove any existing image before loading new one
echo 'Removing any existing prevejo-app image...'
sudo docker rmi -f ${IMAGE_NAME}:latest 2>/dev/null || true

echo 'Loading app image...'
gunzip -c images/prevejo-app.tar.gz | sudo docker load

# Verify the image was loaded correctly
if sudo docker image inspect ${IMAGE_NAME}:latest &>/dev/null; then
    echo 'Image loaded successfully!'
    sudo docker images | grep ${IMAGE_NAME}

    # Verify architecture
    IMG_ARCH=\$(sudo docker image inspect ${IMAGE_NAME}:latest --format '{{.Architecture}}' 2>/dev/null || echo 'unknown')
    echo \"Image architecture: \$IMG_ARCH\"
else
    echo 'ERROR: Failed to load image!'
    exit 1
fi
"

print_step "Setting file permissions..."
run_ssh "
cd ${SERVER_PATH}
chmod 600 .env
chmod +x *.sh
"

print_step "Final port check before starting..."
run_ssh "
# Final check - ensure port is free
PORT_CHECK=\$(lsof -i:${APP_PORT} 2>/dev/null | grep LISTEN || true)
if [ -n \"\$PORT_CHECK\" ]; then
    echo 'WARNING: Port ${APP_PORT} is still in use!'
    echo \"\$PORT_CHECK\"
    echo 'Attempting to free port...'
    fuser -k ${APP_PORT}/tcp 2>/dev/null || true
    sleep 2
fi
echo 'Port ${APP_PORT} is ready.'
"

print_step "Starting container..."
run_ssh "
cd ${SERVER_PATH}
sudo docker compose up -d
"

print_info "Waiting for container to be healthy (up to 60 seconds)..."
for i in {1..20}; do
    sleep 3
    STATUS=$(run_ssh "cd ${SERVER_PATH} && sudo docker compose ps --format '{{.Status}}' 2>/dev/null | head -1" || echo "starting")
    if [[ "$STATUS" == *"healthy"* ]] || [[ "$STATUS" == *"Up"* ]]; then
        print_success "Container is running!"
        break
    fi
    echo -n "."
done
echo ""

#-----------------------------------------------
# Step 12: Debug and Verify
#-----------------------------------------------
print_header "12. VERIFICATION AND DEBUG"

print_step "Running remote debug checks..."
run_ssh "cd ${SERVER_PATH} && ./debug.sh" || true

# Final HTTP check
print_step "Checking HTTP response..."
sleep 3
HTTP_STATUS="000"
for i in {1..6}; do
    HTTP_STATUS=$(run_ssh "curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT}" 2>/dev/null || echo "000")
    if [ "$HTTP_STATUS" == "200" ]; then
        break
    fi
    echo "  Retry $i/6 (HTTP $HTTP_STATUS)..."
    sleep 5
done

#-----------------------------------------------
# Step 13: Cleanup
#-----------------------------------------------
print_header "13. CLEANUP"

if ask_yes_no "Do you want to clean up temporary files on the server (image archives)?"; then
    run_ssh "
    cd ${SERVER_PATH}
    rm -rf images/*.tar.gz 2>/dev/null || true
    rmdir images 2>/dev/null || true
    "
    print_success "Server cleanup completed."
fi

if ask_yes_no "Do you want to clean up local temporary files?"; then
    rm -rf "$EXPORT_DIR"
    print_success "Local cleanup completed."
fi

#-----------------------------------------------
# Final Summary
#-----------------------------------------------
print_header "DEPLOYMENT COMPLETE!"

if [ "$HTTP_STATUS" == "200" ]; then
    echo -e "${GREEN}  Status: SUCCESS (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}  Status: HTTP $HTTP_STATUS (may need restart)${NC}"
fi

echo ""
echo -e "${CYAN}Access URLs:${NC}"
echo "  Application:  ${APP_URL}"
echo "  Direct IP:    http://${SERVER_IP}:${APP_PORT}"
echo ""
echo -e "${CYAN}Server Commands:${NC}"
echo "  cd ${SERVER_PATH}"
echo "  ./status.sh   - Check status"
echo "  ./logs.sh     - View logs"
echo "  ./restart.sh  - Restart container"
echo "  ./rebuild.sh  - Rebuild from new image"
echo "  ./debug.sh    - Debug information"
echo "  ./stop.sh     - Stop container"
echo ""
if [ "$IS_AMAZON" = true ]; then
    echo -e "${CYAN}SSH Access (Amazon):${NC}"
    echo "  ssh -i \"$SSH_KEY_PATH\" ${SERVER_USER}@${SERVER_IP}"
else
    echo -e "${CYAN}SSH Access:${NC}"
    echo "  ssh ${SERVER_USER}@${SERVER_IP} -p ${SSH_PORT}"
fi
echo ""
print_success "Deployment finished!"
