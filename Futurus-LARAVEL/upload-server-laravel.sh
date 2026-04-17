#!/bin/bash

###############################################################################
# FUTURUS LARAVEL - COMPLETE SERVER DEPLOYMENT SCRIPT
#
# Interactive script for building, packaging, uploading, and deploying
# the Futurus Laravel stack to a remote server.
#
# Features:
# - Database backup before deployment
# - Configurable ports for all services
# - Clean old Docker images and volumes
# - Build for MacBook M1 (ARM64) or Linux AMD64
# - Compress images for transfer
# - Upload to remote server (password or SSH key)
# - Amazon EC2 support with .pem key files
# - Remote installation and verification
# - Laravel configuration and migrations
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
BACKUP_DIR="$SCRIPT_DIR/backups"

# Container names
CONTAINER_DB="futurus-db-prod"
CONTAINER_APP="futurus-app-prod"
IMAGE_NAME="futurus-laravel-app"

# Default values
APP_PORT=4444
DB_PORT=3308

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
echo "  _____ _   _ _____ _   _ ____  _   _ ____  "
echo " |  ___| | | |_   _| | | |  _ \| | | / ___| "
echo " | |_  | | | | | | | | | | |_) | | | \___ \ "
echo " |  _| | |_| | | | | |_| |  _ <| |_| |___) |"
echo " |_|    \___/  |_|  \___/|_| \_\\\\___/|____/ "
echo ""
echo "      LARAVEL SERVER DEPLOYMENT"
echo -e "${NC}"

#-----------------------------------------------
# Step 0: Load Root .env Configuration
#-----------------------------------------------
print_header "0. LOADING CONFIGURATION"

ROOT_ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ROOT_ENV_FILE" ]; then
    print_info "Loading root .env configuration..."
    APP_URL=$(grep -E "^APP_URL=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
    DOMAIN=$(grep -E "^DOMAIN=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
    ACME_EMAIL=$(grep -E "^ACME_EMAIL=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
    ENV_PMA_PORT=$(grep -E "^PMA_PORT=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
    PUBLIC_APP_VERSION=$(grep -E "^PUBLIC_APP_VERSION=" "$ROOT_ENV_FILE" | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")

    if [ -n "$APP_URL" ]; then
        print_success "APP_URL: ${APP_URL}"
    fi
    if [ -n "$DOMAIN" ]; then
        print_success "DOMAIN: ${DOMAIN}"
    fi
    if [ -n "$ENV_PMA_PORT" ]; then
        print_success "PMA_PORT: ${ENV_PMA_PORT}"
    fi
    if [ -n "$PUBLIC_APP_VERSION" ]; then
        print_success "VERSION: ${PUBLIC_APP_VERSION}"
    fi
else
    print_warning "No root .env found, will use server IP for APP_URL"
    APP_URL=""
    DOMAIN=""
    ACME_EMAIL=""
    ENV_PMA_PORT=""
    PUBLIC_APP_VERSION=""
fi

#-----------------------------------------------
# Step 1: Database Backup
#-----------------------------------------------
print_header "1. DATABASE BACKUP"

if ask_yes_no "Do you want to create a database backup before deployment?"; then
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="futurus_backup_${TIMESTAMP}.sql"

    print_info "Creating backup: $BACKUP_FILE ..."

    if docker ps --filter "name=futurus-db" --filter "status=running" -q 2>/dev/null | grep -q .; then
        if docker exec futurus-db mysqldump -uroot -p"${DB_ROOT_PASSWORD:-root}" futurusus > "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null; then
            gzip "$BACKUP_DIR/$BACKUP_FILE"
            print_success "Backup created at $BACKUP_DIR/${BACKUP_FILE}.gz"
        else
            print_warning "Failed to create backup. Database container may not be accessible."
        fi
    else
        print_warning "No running database container found. Skipping backup."
    fi
else
    print_info "Skipping database backup."
fi

#-----------------------------------------------
# Step 2: Port Configuration
#-----------------------------------------------
print_header "2. PORT CONFIGURATION"

read -p "Port for application [4444]: " APP_PORT
APP_PORT=${APP_PORT:-4444}

read -p "Port for database [3308]: " DB_PORT
DB_PORT=${DB_PORT:-3308}

DEFAULT_PMA_PORT=${ENV_PMA_PORT:-8080}
read -p "Port for phpMyAdmin [${DEFAULT_PMA_PORT}]: " PMA_PORT
PMA_PORT=${PMA_PORT:-$DEFAULT_PMA_PORT}

print_info "Application will run on port: $APP_PORT"
print_info "Database will run on port: $DB_PORT"
print_info "phpMyAdmin will run on port: $PMA_PORT"

#-----------------------------------------------
# Step 3: Clean Old Docker Images
#-----------------------------------------------
print_header "3. CLEAN OLD DOCKER IMAGES"

if ask_yes_no "Do you want to erase all old Futurus Docker images locally?"; then
    print_step "Removing old Futurus images..."
    docker rmi ${IMAGE_NAME}:latest 2>/dev/null || true
    docker rmi futurus-app:latest 2>/dev/null || true
    docker images | grep futurus | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    print_success "Old images removed."
else
    print_info "Keeping existing images."
fi

#-----------------------------------------------
# Step 4: Clean Old Docker Volumes
#-----------------------------------------------
print_header "4. CLEAN OLD DOCKER VOLUMES"

if ask_yes_no "Do you want to erase all old Futurus Docker volumes locally?"; then
    print_warning "This will DELETE all local database data!"
    if ask_yes_no "Are you absolutely sure?"; then
        print_step "Stopping containers and removing volumes..."
        docker compose down -v 2>/dev/null || true
        docker compose -f docker-compose.prod.yml down -v 2>/dev/null || true
        docker volume ls | grep futurus | awk '{print $2}' | xargs -r docker volume rm -f 2>/dev/null || true
        print_success "Old volumes removed."
    else
        print_info "Cancelled volume removal."
    fi
else
    print_info "Keeping existing volumes."
fi

#-----------------------------------------------
# Step 5: Build and Compile
#-----------------------------------------------
print_header "5. BUILD AND COMPILE"

if ask_yes_no "Do you want to build and compile the Docker images?" "y"; then

    # Step 5.1: Architecture Selection
    print_header "5.1 ARCHITECTURE SELECTION"
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
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Clean bootstrap cache
    print_step "Cleaning bootstrap cache..."
    rm -f core/bootstrap/cache/packages.php 2>/dev/null || true
    rm -f core/bootstrap/cache/services.php 2>/dev/null || true
    rm -f core/bootstrap/cache/config.php 2>/dev/null || true

    # Build Docker image with explicit platform
    print_step "Building Docker image for $PLATFORM (this may take 10-15 minutes)..."

    if docker buildx build --platform "$PLATFORM" --provenance=false -t ${IMAGE_NAME}:latest -f Dockerfile.prod --load . 2>&1 | while read line; do
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
# Step 6: Export and Compress Images
#-----------------------------------------------
print_header "6. EXPORT AND COMPRESS IMAGES"

if ask_yes_no "Do you want to export and compress Docker images for transfer?" "y"; then
    rm -rf "$EXPORT_DIR"
    mkdir -p "$EXPORT_DIR/images"
    mkdir -p "$EXPORT_DIR/SQL"
    mkdir -p "$EXPORT_DIR/backups"

    print_step "Exporting application image..."
    docker save ${IMAGE_NAME}:latest | gzip > "$EXPORT_DIR/images/futurus-app.tar.gz"
    print_success "App image exported: $(du -h "$EXPORT_DIR/images/futurus-app.tar.gz" | cut -f1)"

    print_step "Pulling and exporting MariaDB image..."
    printf 'FROM mariadb:10.6\n' | docker buildx build --platform linux/amd64 --provenance=false -t mariadb:10.6 --load - 2>/dev/null || \
        docker pull --platform linux/amd64 mariadb:10.6
    docker save mariadb:10.6 | gzip > "$EXPORT_DIR/images/mariadb.tar.gz"
    print_success "MariaDB image exported: $(du -h "$EXPORT_DIR/images/mariadb.tar.gz" | cut -f1)"

    print_step "Pulling and exporting phpMyAdmin image..."
    printf 'FROM phpmyadmin:latest\n' | docker buildx build --platform linux/amd64 --provenance=false -t phpmyadmin:latest --load - 2>/dev/null || \
        docker pull --platform linux/amd64 phpmyadmin:latest
    docker save phpmyadmin:latest | gzip > "$EXPORT_DIR/images/phpmyadmin.tar.gz"
    print_success "phpMyAdmin image exported: $(du -h "$EXPORT_DIR/images/phpmyadmin.tar.gz" | cut -f1)"

    # Copy SQL files if they exist
    if [ -d "SQL" ]; then
        cp -r SQL/* "$EXPORT_DIR/SQL/" 2>/dev/null || true
        print_success "SQL files copied."
    fi

    print_success "Total export size: $(du -sh "$EXPORT_DIR" | cut -f1)"
else
    print_info "Skipping image export."
fi

#-----------------------------------------------
# Step 7: Restore Database Backup
#-----------------------------------------------
print_header "7. INCLUDE DATABASE BACKUP"

if ask_yes_no "Do you want to include a database backup to restore on the server?"; then
    BACKUPS=($(ls -t "$BACKUP_DIR"/*.sql.gz "$BACKUP_DIR"/*.sql 2>/dev/null || true))

    if [ ${#BACKUPS[@]} -eq 0 ]; then
        print_warning "No backups found in $BACKUP_DIR"
    else
        print_info "Available backups:"
        for i in "${!BACKUPS[@]}"; do
            echo "  $((i+1))) $(basename "${BACKUPS[$i]}")"
        done
        echo ""
        read -p "Select backup number (0 to skip): " backup_num

        if [[ "$backup_num" -gt 0 && "$backup_num" -le "${#BACKUPS[@]}" ]]; then
            SELECTED_BACKUP="${BACKUPS[$((backup_num-1))]}"
            mkdir -p "$EXPORT_DIR/backups"
            cp "$SELECTED_BACKUP" "$EXPORT_DIR/backups/"
            print_success "Backup selected: $(basename "$SELECTED_BACKUP")"
        else
            print_info "No backup selected."
        fi
    fi
else
    print_info "Skipping backup inclusion."
fi

#-----------------------------------------------
# Step 8: Server Configuration
#-----------------------------------------------
print_header "8. SERVER CONFIGURATION"

read -p "Server IP or hostname: " SERVER_IP
if [ -z "$SERVER_IP" ]; then
    print_error "Server IP is required!"
    exit 1
fi

#-----------------------------------------------
# Step 9: SSH Authentication
#-----------------------------------------------
print_header "9. SSH AUTHENTICATION"

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

read -p "Remote installation path [/var/www/futurus]: " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-/var/www/futurus}

read -p "SSH Port [22]: " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

# SSH Connection Multiplexing - reuse one connection to avoid server throttling
SSH_CONTROL_PATH="/tmp/.deploy_ssh_mux_%r@%h:%p"

# Cleanup multiplexed connection on script exit
cleanup_ssh_mux() {
    ssh -o ControlPath="$SSH_CONTROL_PATH" -O exit "${SERVER_USER}@${SERVER_IP}" 2>/dev/null || true
}
trap cleanup_ssh_mux EXIT

SSH_COMMON_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -o ControlMaster=auto -o ControlPath=${SSH_CONTROL_PATH} -o ControlPersist=300"

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
        ssh ${SSH_COMMON_OPTS} -i "$SSH_KEY_PATH" -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
    }

    run_scp() {
        scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -i "$SSH_KEY_PATH" -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
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
        sshpass -p "$SERVER_PASS" ssh ${SSH_COMMON_OPTS} -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
    }

    run_scp() {
        sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
    }
fi

#-----------------------------------------------
# Sudo Password Configuration
#-----------------------------------------------
if [[ "$SERVER_USER" != "root" ]]; then
    print_header "SUDO CONFIGURATION"
    print_info "You are connecting as '${SERVER_USER}' (non-root)."
    print_info "Sudo password is needed for Docker and file operations on the server."
    echo ""
    if [[ "$IS_AMAZON" == "false" ]] && [ -n "${SERVER_PASS:-}" ]; then
        if ask_yes_no "Use the same SSH password for sudo?"; then
            SUDO_PASS="$SERVER_PASS"
        else
            read -sp "Enter sudo password for '${SERVER_USER}': " SUDO_PASS
            echo ""
        fi
    else
        read -sp "Enter sudo password for '${SERVER_USER}': " SUDO_PASS
        echo ""
    fi
    print_success "Sudo password configured."

    # Override run_ssh: use SUDO_ASKPASS to provide password without consuming stdin
    # This keeps stdin free for piped commands like: gunzip | sudo docker load
    SUDO_SETUP_CMD=""
    printf -v SUDO_SETUP_CMD '_SUDO_ASK=$(mktemp /tmp/.sudo_askpass.XXXXXX); chmod 700 "$_SUDO_ASK"; echo "#!/bin/sh" > "$_SUDO_ASK"; echo "echo %q" >> "$_SUDO_ASK"; export SUDO_ASKPASS="$_SUDO_ASK"; sudo() { command sudo -A "$@"; }; trap "rm -f \\$_SUDO_ASK" EXIT; ' "$SUDO_PASS"

    if [[ "$IS_AMAZON" == "true" ]]; then
        run_ssh() {
            local cmd="$1"
            ssh ${SSH_COMMON_OPTS} -i "$SSH_KEY_PATH" -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "${SUDO_SETUP_CMD}${cmd}"
        }
    else
        run_ssh() {
            local cmd="$1"
            sshpass -p "$SERVER_PASS" ssh ${SSH_COMMON_OPTS} -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "${SUDO_SETUP_CMD}${cmd}"
        }
    fi

    # Override run_scp: upload to /tmp first, then move with sudo
    if [[ "$IS_AMAZON" == "true" ]]; then
        run_scp() {
            local src="$1"
            local dest="$2"
            local filename
            filename=$(basename "$src")
            local tmp_dest="/tmp/_deploy_${filename}"
            scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -i "$SSH_KEY_PATH" -P "$SSH_PORT" -r "$src" "${SERVER_USER}@${SERVER_IP}:${tmp_dest}"
            run_ssh "if [ -d '${tmp_dest}' ]; then sudo cp -rf '${tmp_dest}/.' '${dest}' 2>/dev/null || sudo cp -rf '${tmp_dest}' '${dest}'; rm -rf '${tmp_dest}'; else sudo mv -f '${tmp_dest}' '${dest}'; fi"
        }
    else
        run_scp() {
            local src="$1"
            local dest="$2"
            local filename
            filename=$(basename "$src")
            local tmp_dest="/tmp/_deploy_${filename}"
            sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -P "$SSH_PORT" -r "$src" "${SERVER_USER}@${SERVER_IP}:${tmp_dest}"
            run_ssh "if [ -d '${tmp_dest}' ]; then sudo cp -rf '${tmp_dest}/.' '${dest}' 2>/dev/null || sudo cp -rf '${tmp_dest}' '${dest}'; rm -rf '${tmp_dest}'; else sudo mv -f '${tmp_dest}' '${dest}'; fi"
        }
    fi
    print_info "SCP uploads will go through /tmp to handle permissions."
else
    SUDO_PASS=""
fi

echo ""
print_info "Target: ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}"

#-----------------------------------------------
# Step 10: Test SSH Connection
#-----------------------------------------------
print_header "10. TESTING CONNECTION"

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

            # Close old multiplexed connection
            cleanup_ssh_mux

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
                    ssh ${SSH_COMMON_OPTS} -i "$SSH_KEY_PATH" -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
                }
                run_scp() {
                    scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -i "$SSH_KEY_PATH" -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
                }
            else
                IS_AMAZON=false
                read -sp "SSH Password: " SERVER_PASS
                echo ""
                run_ssh() {
                    sshpass -p "$SERVER_PASS" ssh ${SSH_COMMON_OPTS} -p "$SSH_PORT" "${SERVER_USER}@${SERVER_IP}" "$1"
                }
                run_scp() {
                    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -P "$SSH_PORT" -r "$1" "${SERVER_USER}@${SERVER_IP}:$2"
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
# Step 11: Create Server Configuration Files
#-----------------------------------------------
print_header "11. CREATING SERVER FILES"

# Generate secure passwords
DB_PASSWORD=$(dd if=/dev/urandom bs=32 count=1 2>/dev/null | LC_ALL=C tr -dc 'A-Za-z0-9' | cut -c1-24)
DB_ROOT_PASSWORD=$(dd if=/dev/urandom bs=48 count=1 2>/dev/null | LC_ALL=C tr -dc 'A-Za-z0-9' | cut -c1-32)

print_step "Creating docker-compose.yml..."
cat > "$EXPORT_DIR/docker-compose.yml" << COMPOSE_EOF
services:
  app:
    image: ${IMAGE_NAME}:latest
    container_name: ${CONTAINER_APP}
    restart: always
    ports:
      - "${APP_PORT}:80"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - APACHE_DOCUMENT_ROOT=/var/www/html
    depends_on:
      db:
        condition: service_healthy
    networks:
      - futurus-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  db:
    image: mariadb:10.6
    container_name: ${CONTAINER_DB}
    restart: always
    ports:
      - "${DB_PORT}:3306"
    environment:
      MARIADB_DATABASE: \${DB_DATABASE}
      MARIADB_USER: \${DB_USERNAME}
      MARIADB_PASSWORD: \${DB_PASSWORD}
      MARIADB_ROOT_PASSWORD: \${DB_ROOT_PASSWORD}
    volumes:
      - futurus-db-data:/var/lib/mysql
      - ./SQL:/docker-entrypoint-initdb.d
    networks:
      - futurus-network
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 90s

  phpmyadmin:
    image: phpmyadmin:latest
    container_name: futurus-phpmyadmin-prod
    restart: always
    ports:
      - "${PMA_PORT}:80"
    environment:
      PMA_HOST: db
      PMA_ARBITRARY: 1
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD}
    depends_on:
      - db
    networks:
      - futurus-network

networks:
  futurus-network:
    driver: bridge

volumes:
  futurus-db-data:
COMPOSE_EOF

print_step "Creating .env file..."
cat > "$EXPORT_DIR/.env" << ENV_EOF
# Application Configuration
APP_URL=${APP_URL:-http://${SERVER_IP}:${APP_PORT}}
DOMAIN=${DOMAIN:-}
ACME_EMAIL=${ACME_EMAIL:-}

# Database Configuration
DB_DATABASE=futurusus
DB_USERNAME=futurusus
DB_PASSWORD=${DB_PASSWORD}
DB_ROOT_PASSWORD=${DB_ROOT_PASSWORD}

# Ports
APP_PORT=${APP_PORT}
DB_PORT=${DB_PORT}
PMA_PORT=${PMA_PORT}
ENV_EOF

# Create management scripts
print_step "Creating management scripts..."

cat > "$EXPORT_DIR/start.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env 2>/dev/null || true
sudo docker compose up -d
echo "Containers started."
echo "Access: ${APP_URL:-http://localhost:4444}"
SCRIPT_EOF

cat > "$EXPORT_DIR/stop.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
sudo docker compose down
echo "Containers stopped."
SCRIPT_EOF

cat > "$EXPORT_DIR/restart.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
sudo docker compose restart
echo "Containers restarted."
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
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:${APP_PORT:-4444} || echo "App not responding"
echo ""
echo "=== Disk Usage ==="
sudo docker system df
SCRIPT_EOF

cat > "$EXPORT_DIR/backup.sh" << 'SCRIPT_EOF'
#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
source .env

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

echo "Creating backup..."
sudo docker exec futurus-db-prod mysqldump -uroot -p"${DB_ROOT_PASSWORD}" "${DB_DATABASE}" | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
echo "Backup saved: ${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
SCRIPT_EOF

cat > "$EXPORT_DIR/restore.sh" << 'SCRIPT_EOF'
#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
source .env

if [ -z "${1:-}" ]; then
    echo "Usage: ./restore.sh <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la backups/*.sql.gz 2>/dev/null || echo "  No backups found"
    exit 1
fi

echo "Restoring from $1..."
gunzip -c "$1" | sudo docker exec -i futurus-db-prod mysql -uroot -p"${DB_ROOT_PASSWORD}" "${DB_DATABASE}"
echo "Restore complete!"
SCRIPT_EOF

cat > "$EXPORT_DIR/debug.sh" << 'SCRIPT_EOF'
#!/bin/bash
cd "$(dirname "$0")"
source .env

echo "=== FUTURUS DEBUG INFO ==="
echo ""
echo "=== Container Status ==="
sudo docker compose ps
echo ""
echo "=== App Container Logs (last 50 lines) ==="
sudo docker logs futurus-app-prod --tail 50 2>&1 || echo "Cannot get app logs"
echo ""
echo "=== DB Container Logs (last 20 lines) ==="
sudo docker logs futurus-db-prod --tail 20 2>&1 || echo "Cannot get db logs"
echo ""
echo "=== HTTP Health Check ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" http://localhost:${APP_PORT:-4444} || echo "App not responding"
echo ""
echo "=== Laravel .env Check ==="
sudo docker exec futurus-app-prod cat /var/www/html/core/.env 2>/dev/null | grep -E "^(APP_|DB_)" || echo "Cannot read Laravel .env"
echo ""
echo "=== DB Connection Test ==="
sudo docker exec futurus-app-prod php /var/www/html/core/artisan tinker --execute="DB::connection()->getPdo(); echo 'DB OK';" 2>/dev/null || echo "DB connection failed"
echo ""
echo "=== Docker Images ==="
sudo docker images | grep -E 'futurus|mariadb' || echo "No images found"
SCRIPT_EOF

print_success "Server files created."

#-----------------------------------------------
# Step 12: Upload to Server
#-----------------------------------------------
print_header "12. UPLOAD TO SERVER"

if ask_yes_no "Ready to upload files to $SERVER_IP. Continue?" "y"; then

    # Prepare server directory
    print_step "Preparing server directory..."
    run_ssh "
    # Try without sudo first
    if mkdir -p ${SERVER_PATH}/images ${SERVER_PATH}/SQL ${SERVER_PATH}/backups 2>/dev/null; then
        echo 'Directories created successfully'
    else
        # Try with sudo
        echo 'Permission denied, trying with sudo...'
        sudo mkdir -p ${SERVER_PATH}/images ${SERVER_PATH}/SQL ${SERVER_PATH}/backups
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

    # Check DB port too
    print_step "Checking if port ${DB_PORT} is in use..."
    run_ssh "
    echo 'Checking port ${DB_PORT}...'
    PORT_PID=\$(lsof -t -i:${DB_PORT} 2>/dev/null || true)
    if [ -n \"\$PORT_PID\" ]; then
        echo \"Port ${DB_PORT} is in use by PID: \$PORT_PID\"
        echo 'Killing processes...'
        kill -9 \$PORT_PID 2>/dev/null || true
        sleep 1
        echo 'Port freed.'
    else
        echo 'Port ${DB_PORT} is free.'
    fi
    " || true

    # Check phpMyAdmin port too
    print_step "Checking if port ${PMA_PORT} is in use..."
    run_ssh "
    echo 'Checking port ${PMA_PORT}...'
    PORT_PID=\$(lsof -t -i:${PMA_PORT} 2>/dev/null || true)
    if [ -n \"\$PORT_PID\" ]; then
        echo \"Port ${PMA_PORT} is in use by PID: \$PORT_PID\"
        echo 'Killing processes...'
        kill -9 \$PORT_PID 2>/dev/null || true
        sleep 1
        echo 'Port freed.'
    else
        echo 'Port ${PMA_PORT} is free.'
    fi
    " || true

    # Ask about removing old volumes
    REMOVE_VOLUMES="n"
    if ask_yes_no "Do you want to remove old Docker volumes on the remote server?"; then
        REMOVE_VOLUMES="y"
        print_warning "Old volumes will be removed! This will DELETE database data!"
    else
        print_info "Keeping existing volumes."
    fi

    # Stop and remove old Docker containers
    print_step "Stopping and removing old Docker containers..."
    run_ssh "
    echo 'Stopping old containers...'
    cd ${SERVER_PATH} 2>/dev/null || true
    sudo docker compose down 2>/dev/null || true
    sudo docker stop ${CONTAINER_APP} ${CONTAINER_DB} 2>/dev/null || true
    sudo docker rm -f ${CONTAINER_APP} ${CONTAINER_DB} 2>/dev/null || true

    # Stop any container using the same ports
    CONTAINER_ON_PORT=\$(sudo docker ps -q --filter 'publish=${APP_PORT}' 2>/dev/null || true)
    if [ -n \"\$CONTAINER_ON_PORT\" ]; then
        echo \"Found container using port ${APP_PORT}: \$CONTAINER_ON_PORT\"
        sudo docker stop \$CONTAINER_ON_PORT 2>/dev/null || true
        sudo docker rm -f \$CONTAINER_ON_PORT 2>/dev/null || true
    fi
    CONTAINER_ON_DB_PORT=\$(sudo docker ps -q --filter 'publish=${DB_PORT}' 2>/dev/null || true)
    if [ -n \"\$CONTAINER_ON_DB_PORT\" ]; then
        echo \"Found container using port ${DB_PORT}: \$CONTAINER_ON_DB_PORT\"
        sudo docker stop \$CONTAINER_ON_DB_PORT 2>/dev/null || true
        sudo docker rm -f \$CONTAINER_ON_DB_PORT 2>/dev/null || true
    fi
    echo 'Containers stopped and removed.'
    " || true

    # Remove old Docker volumes if requested
    if [[ "$REMOVE_VOLUMES" == "y" ]]; then
        print_step "Removing old Docker volumes..."
        run_ssh "
        echo 'Listing volumes...'
        sudo docker volume ls

        # Remove volumes associated with futurus
        FUTURUS_VOLUMES=\$(sudo docker volume ls -q | grep -i futurus 2>/dev/null || true)
        if [ -n \"\$FUTURUS_VOLUMES\" ]; then
            echo \"Removing futurus volumes: \$FUTURUS_VOLUMES\"
            sudo docker volume rm -f \$FUTURUS_VOLUMES 2>/dev/null || true
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
    echo 'Checking for old futurus images...'
    OLD_IMAGES=\$(sudo docker images -q ${IMAGE_NAME} 2>/dev/null || true)
    if [ -n \"\$OLD_IMAGES\" ]; then
        echo \"Removing old app images: \$OLD_IMAGES\"
        sudo docker rmi -f \$OLD_IMAGES 2>/dev/null || true
    fi

    # Also remove mariadb if we're updating
    OLD_MARIADB=\$(sudo docker images -q mariadb 2>/dev/null || true)
    if [ -n \"\$OLD_MARIADB\" ]; then
        echo \"Removing old mariadb images: \$OLD_MARIADB\"
        sudo docker rmi -f \$OLD_MARIADB 2>/dev/null || true
    fi

    # Prune dangling images
    sudo docker image prune -f 2>/dev/null || true
    echo 'Old images cleaned.'
    " || true

    # Remove old image files on server
    print_step "Cleaning old image files on server..."
    run_ssh "
    cd ${SERVER_PATH}/images 2>/dev/null || true
    if [ -f 'futurus-app.tar.gz' ]; then
        echo 'Removing old app image archive...'
        rm -f futurus-app.tar.gz
    fi
    if [ -f 'mariadb.tar.gz' ]; then
        echo 'Removing old mariadb image archive...'
        rm -f mariadb.tar.gz
    fi
    echo 'Old image files cleaned.'
    " || true

    # Bundle everything (images + config + SQL + backups) into one tar for upload
    print_step "Creating deployment bundle..."
    DEPLOY_BUNDLE="/tmp/_deploy_bundle.tar.gz"
    (cd "$EXPORT_DIR" && tar czf "$DEPLOY_BUNDLE" \
        images/futurus-app.tar.gz images/mariadb.tar.gz images/phpmyadmin.tar.gz \
        docker-compose.yml .env \
        start.sh stop.sh restart.sh logs.sh status.sh backup.sh restore.sh debug.sh \
        $([ -d "SQL" ] && [ "$(ls -A SQL 2>/dev/null)" ] && echo "SQL/") \
        $([ -d "backups" ] && [ "$(ls -A backups 2>/dev/null)" ] && echo "backups/") \
        2>/dev/null)
    print_success "Bundle created: $(du -h "$DEPLOY_BUNDLE" | cut -f1)"

    # Upload the single bundle to /tmp on the server (always writable)
    print_step "Uploading deployment bundle (this may take several minutes)..."
    if [[ "$IS_AMAZON" == "true" ]]; then
        scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -i "$SSH_KEY_PATH" -P "$SSH_PORT" "$DEPLOY_BUNDLE" "${SERVER_USER}@${SERVER_IP}:/tmp/_deploy_bundle.tar.gz"
    else
        sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -o ControlMaster=auto -o "ControlPath=${SSH_CONTROL_PATH}" -o ControlPersist=300 -P "$SSH_PORT" "$DEPLOY_BUNDLE" "${SERVER_USER}@${SERVER_IP}:/tmp/_deploy_bundle.tar.gz"
    fi
    rm -f "$DEPLOY_BUNDLE"
    print_success "Bundle uploaded to server."

    # Extract bundle on server with sudo
    print_step "Extracting deployment files on server..."
    run_ssh "
        set -e
        cd ${SERVER_PATH}
        sudo tar xzf /tmp/_deploy_bundle.tar.gz
        rm -f /tmp/_deploy_bundle.tar.gz
        echo 'Verifying files...'
        ls -la images/futurus-app.tar.gz images/mariadb.tar.gz images/phpmyadmin.tar.gz
        ls -la docker-compose.yml .env
        echo 'All files extracted successfully.'
    "
    print_success "All files uploaded and verified."
else
    print_info "Upload cancelled."
    exit 0
fi

#-----------------------------------------------
# Step 13: Remote Installation
#-----------------------------------------------
print_header "13. REMOTE INSTALLATION"

print_step "Installing Docker on server (if needed)..."
run_ssh "
if ! command -v docker &> /dev/null; then
    echo 'Installing Docker...'
    curl -fsSL https://get.docker.com | sudo sh
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# Add current user to docker group if not already
if ! groups | grep -q docker; then
    echo 'Adding user to docker group...'
    sudo usermod -aG docker \$(whoami)
    echo 'User added to docker group.'
fi

echo 'Docker version:' \$(sudo docker --version)
"

print_step "Loading Docker images on server..."
run_ssh "
cd ${SERVER_PATH}

# Verify the image archives exist
if [ ! -f 'images/futurus-app.tar.gz' ]; then
    echo 'ERROR: App image archive not found!'
    exit 1
fi
if [ ! -f 'images/mariadb.tar.gz' ]; then
    echo 'ERROR: MariaDB image archive not found!'
    exit 1
fi
if [ ! -f 'images/phpmyadmin.tar.gz' ]; then
    echo 'WARNING: phpMyAdmin image archive not found, will pull from registry'
fi

# Check file sizes
APP_SIZE=\$(stat -c%s 'images/futurus-app.tar.gz' 2>/dev/null || stat -f%z 'images/futurus-app.tar.gz' 2>/dev/null || echo '0')
DB_SIZE=\$(stat -c%s 'images/mariadb.tar.gz' 2>/dev/null || stat -f%z 'images/mariadb.tar.gz' 2>/dev/null || echo '0')
PMA_SIZE=\$(stat -c%s 'images/phpmyadmin.tar.gz' 2>/dev/null || stat -f%z 'images/phpmyadmin.tar.gz' 2>/dev/null || echo '0')
echo \"App image archive size: \$APP_SIZE bytes\"
echo \"MariaDB image archive size: \$DB_SIZE bytes\"
echo \"phpMyAdmin image archive size: \$PMA_SIZE bytes\"

# Remove existing images before loading
echo 'Removing any existing images...'
sudo docker rmi -f ${IMAGE_NAME}:latest 2>/dev/null || true
sudo docker rmi -f mariadb:10.6 2>/dev/null || true
sudo docker rmi -f phpmyadmin:latest 2>/dev/null || true

echo 'Loading MariaDB image...'
gunzip -c images/mariadb.tar.gz | sudo docker load

echo 'Loading app image...'
gunzip -c images/futurus-app.tar.gz | sudo docker load

echo 'Loading phpMyAdmin image...'
if [ -f 'images/phpmyadmin.tar.gz' ]; then
    gunzip -c images/phpmyadmin.tar.gz | sudo docker load
else
    echo 'Pulling phpMyAdmin from registry...'
    sudo docker pull phpmyadmin:latest
fi

# Verify images loaded correctly
echo 'Verifying images...'
if sudo docker image inspect ${IMAGE_NAME}:latest &>/dev/null; then
    echo 'App image loaded successfully!'
    IMG_ARCH=\$(sudo docker image inspect ${IMAGE_NAME}:latest --format '{{.Architecture}}' 2>/dev/null || echo 'unknown')
    echo \"App image architecture: \$IMG_ARCH\"
else
    echo 'ERROR: Failed to load app image!'
    exit 1
fi

if sudo docker image inspect mariadb:10.6 &>/dev/null; then
    echo 'MariaDB image loaded successfully!'
else
    echo 'ERROR: Failed to load MariaDB image!'
    exit 1
fi

if sudo docker image inspect phpmyadmin:latest &>/dev/null; then
    echo 'phpMyAdmin image loaded successfully!'
else
    echo 'WARNING: phpMyAdmin image not available, will be pulled on start'
fi

sudo docker images | grep -E 'futurus|mariadb|phpmyadmin'
"

print_step "Setting file permissions..."
run_ssh "
cd ${SERVER_PATH}
sudo chown \$(whoami):\$(whoami) .env docker-compose.yml *.sh 2>/dev/null || true
sudo chmod 600 .env
sudo chmod +x *.sh
"

print_step "Final port check before starting..."
run_ssh "
PORT_CHECK=\$(lsof -i:${APP_PORT} 2>/dev/null | grep LISTEN || true)
if [ -n \"\$PORT_CHECK\" ]; then
    echo 'WARNING: Port ${APP_PORT} is still in use!'
    fuser -k ${APP_PORT}/tcp 2>/dev/null || true
    sleep 2
fi
PORT_CHECK_DB=\$(lsof -i:${DB_PORT} 2>/dev/null | grep LISTEN || true)
if [ -n \"\$PORT_CHECK_DB\" ]; then
    echo 'WARNING: Port ${DB_PORT} is still in use!'
    fuser -k ${DB_PORT}/tcp 2>/dev/null || true
    sleep 2
fi
echo 'Ports are ready.'
"

print_step "Starting containers..."
run_ssh "
cd ${SERVER_PATH}
sudo docker compose up -d
"

print_info "Waiting for containers to be healthy (up to 90 seconds)..."
for i in {1..30}; do
    sleep 3
    STATUS=$(run_ssh "cd ${SERVER_PATH} && sudo docker compose ps --format '{{.Status}}' 2>/dev/null | head -1" || echo "starting")
    if [[ "$STATUS" == *"healthy"* ]]; then
        print_success "Containers are healthy!"
        break
    fi
    echo -n "."
done
echo ""

#-----------------------------------------------
# Step 14: Configure Laravel
#-----------------------------------------------
print_header "14. CONFIGURING LARAVEL"

FINAL_APP_URL="${APP_URL:-http://${SERVER_IP}:${APP_PORT}}"
print_info "Using APP_URL: $FINAL_APP_URL"

run_ssh "
DEPLOY_APP_URL='${FINAL_APP_URL}'
DEPLOY_APP_VERSION='${PUBLIC_APP_VERSION}'
cd ${SERVER_PATH}
export \$(grep -v '^#' .env | xargs)

# Update Laravel .env
echo 'Syncing Laravel configuration...'
sudo docker exec ${CONTAINER_APP} sed -i \"s/^DB_HOST=.*/DB_HOST=db/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s/^DB_DATABASE=.*/DB_DATABASE=\${DB_DATABASE}/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s/^DB_USERNAME=.*/DB_USERNAME=\${DB_USERNAME}/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s/^DB_PASSWORD=.*/DB_PASSWORD=\${DB_PASSWORD}/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s/^APP_ENV=.*/APP_ENV=production/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s/^APP_DEBUG=.*/APP_DEBUG=false/\" /var/www/html/core/.env
sudo docker exec ${CONTAINER_APP} sed -i \"s|^APP_URL=.*|APP_URL=\${DEPLOY_APP_URL}|\" /var/www/html/core/.env

# Update app version if set
if [ -n \"\${DEPLOY_APP_VERSION}\" ]; then
    echo \"Setting app version: \${DEPLOY_APP_VERSION}\"
    if grep -q '^PUBLIC_APP_VERSION=' /var/www/html/core/.env 2>/dev/null; then
        sudo docker exec ${CONTAINER_APP} sed -i \"s|^PUBLIC_APP_VERSION=.*|PUBLIC_APP_VERSION=\${DEPLOY_APP_VERSION}|\" /var/www/html/core/.env
    else
        sudo docker exec ${CONTAINER_APP} bash -c \"echo 'PUBLIC_APP_VERSION=\${DEPLOY_APP_VERSION}' >> /var/www/html/core/.env\"
    fi
fi

# Generate key and run migrations before anything else
echo 'Generating app key...'
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan key:generate --force 2>/dev/null || true

echo 'Running database migrations...'
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan migrate --force 2>&1 || echo 'Warning: migrations had issues, check logs'

# Clear caches
echo 'Clearing caches...'
sudo docker exec ${CONTAINER_APP} rm -f /var/www/html/core/bootstrap/cache/*.php 2>/dev/null || true
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan config:clear 2>/dev/null || true
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan cache:clear 2>/dev/null || true
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan view:clear 2>/dev/null || true

# Set permissions
echo 'Setting permissions...'
sudo docker exec ${CONTAINER_APP} chown -R www-data:www-data /var/www/html/core/storage 2>/dev/null || true
sudo docker exec ${CONTAINER_APP} chmod -R 775 /var/www/html/core/storage 2>/dev/null || true

# Restart app
echo 'Restarting app...'
sudo docker restart ${CONTAINER_APP}
sleep 5
"

print_success "Laravel configured."

print_step "Setting up initial admin user..."
run_ssh "
cd ${SERVER_PATH}
echo 'Configuring admin user...'
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan tinker --execute=\"
\\\$admin = \\\\App\\\\Models\\\\Admin::where('username', 'admin')->first();
if(\\\$admin) {
    \\\$admin->password = \\\\Hash::make('admin123');
    \\\$admin->save();
    echo 'Admin password updated successfully';
} else {
    echo 'Admin user not found - creating new one';
    \\\$admin = new \\\\App\\\\Models\\\\Admin();
    \\\$admin->name = 'Super Admin';
    \\\$admin->username = 'admin';
    \\\$admin->email = 'admin@example.com';
    \\\$admin->password = \\\\Hash::make('admin123');
    \\\$admin->save();
    echo 'Admin user created successfully';
}
\" 2>/dev/null || echo 'Note: Admin setup skipped (may already exist or migrations pending)'
"
print_success "Admin user configured (username: admin, password: admin123)"

#-----------------------------------------------
# Step 15: Verification and Debug
#-----------------------------------------------
print_header "15. VERIFICATION AND DEBUG"

print_step "Running remote debug checks..."
run_ssh "
cd ${SERVER_PATH}
source .env 2>/dev/null || true

echo '=== Container Status ==='
sudo docker compose ps
echo ''
echo '=== App Container Logs (last 30 lines) ==='
sudo docker logs ${CONTAINER_APP} --tail 30 2>&1 || echo 'Cannot get app logs'
echo ''
echo '=== DB Container Logs (last 10 lines) ==='
sudo docker logs ${CONTAINER_DB} --tail 10 2>&1 || echo 'Cannot get db logs'
echo ''
echo '=== HTTP Health Check ==='
curl -s -o /dev/null -w 'HTTP Status: %{http_code}\nResponse Time: %{time_total}s\n' http://localhost:${APP_PORT} || echo 'App not responding'
echo ''
echo '=== Laravel .env Check ==='
sudo docker exec ${CONTAINER_APP} cat /var/www/html/core/.env 2>/dev/null | grep -E '^(APP_|DB_)' || echo 'Cannot read Laravel .env'
echo ''
echo '=== DB Connection Test ==='
sudo docker exec ${CONTAINER_APP} php /var/www/html/core/artisan tinker --execute=\"DB::connection()->getPdo(); echo 'DB OK';\" 2>/dev/null || echo 'DB connection failed'
echo ''
echo '=== Docker Images ==='
sudo docker images | grep -E 'futurus|mariadb|phpmyadmin' || echo 'No images found'
" || true

# Final HTTP check
print_step "Checking HTTP response..."
sleep 5
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
# Step 16: Cleanup
#-----------------------------------------------
print_header "16. CLEANUP"

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
echo "  Application:  ${FINAL_APP_URL}"
echo "  Admin Panel:  ${FINAL_APP_URL}/admin"
echo "  phpMyAdmin:   http://${SERVER_IP}:${PMA_PORT}"
echo "  Direct IP:    http://${SERVER_IP}:${APP_PORT}"
echo ""
echo -e "${CYAN}Credentials (SAVE THESE!):${NC}"
echo "  Admin Login:     admin / admin123"
echo "  DB Username:     futurusus"
echo "  DB Password:     ${DB_PASSWORD}"
echo "  DB Root Pass:    ${DB_ROOT_PASSWORD}"
echo ""
echo -e "${CYAN}Server Commands:${NC}"
echo "  cd ${SERVER_PATH}"
echo "  ./status.sh   - Check status"
echo "  ./logs.sh     - View logs"
echo "  ./restart.sh  - Restart containers"
echo "  ./backup.sh   - Backup database"
echo "  ./debug.sh    - Debug information"
echo "  ./stop.sh     - Stop containers"
echo ""
if [ "$IS_AMAZON" = true ]; then
    echo -e "${CYAN}SSH Access (Amazon):${NC}"
    echo "  ssh -i \"$SSH_KEY_PATH\" ${SERVER_USER}@${SERVER_IP}"
else
    echo -e "${CYAN}SSH Access:${NC}"
    echo "  ssh ${SERVER_USER}@${SERVER_IP} -p ${SSH_PORT}"
fi
echo ""
echo -e "${YELLOW}NOTE: Database passwords were auto-generated.${NC}"
echo -e "${YELLOW}They are also saved in ${SERVER_PATH}/.env${NC}"
echo ""
print_success "Deployment finished!"
