#!/usr/bin/env bash
###############################################################################
# Futurus - Super Upload & Deploy Script
#
# Interactive end-to-end production deployment:
#   1.  Choose platform (linux/amd64 or mac arm64)
#   2.  Configure ports (backend / admin / frontend / postgres / pgadmin)
#   3.  Optional local cleanup (old images / old volumes)
#   4.  Build production images locally
#   5.  DB backup + bundle uploads/
#   6.  Export & compress images to ./.deploy_temp
#   7.  Prompt remote SSH config (IP, user, port, key|password, install path)
#   8.  Test connection (loop on failure)
#   9.  Detect sudo requirement
#  10.  Remote cleanup (stop old containers / remove old images / remove old volumes)
#  11.  Upload bundle + compose + .env + management scripts
#  12.  Load images & start stack on remote, run health checks
#  13.  Optional cleanup (remote artifacts / local temp)
#  14.  Optional database restore
###############################################################################

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; C='\033[0;36m'; P='\033[0;35m'; N='\033[0m'
print_header()  { echo -e "\n${P}=============================================="; echo -e " $1"; echo -e "==============================================${N}\n"; }
print_step()    { echo -e "${B}[STEP]${N} $1"; }
print_success() { echo -e "${G}[ OK ]${N} $1"; }
print_warning() { echo -e "${Y}[WARN]${N} $1"; }
print_error()   { echo -e "${R}[FAIL]${N} $1" >&2; }
print_info()    { echo -e "${C}[INFO]${N} $1"; }

ask_yn() {
  local prompt="$1" default="${2:-n}" resp
  if [ "$default" = "y" ]; then read -rp "$prompt (Y/n): " resp; resp=${resp:-y}
  else                          read -rp "$prompt (y/N): " resp; resp=${resp:-n}
  fi
  [[ "$resp" =~ ^[Yy]$ ]]
}

ask_def() { local prompt="$1" def="$2" resp; read -rp "$prompt [$def]: " resp; echo "${resp:-$def}"; }

# Load root .env
ROOT_ENV="$SCRIPT_DIR/.env"
[ -f "$ROOT_ENV" ] && { set -a; . "$ROOT_ENV"; set +a; }

EXPORT_DIR="$SCRIPT_DIR/.deploy_temp"
BACKUP_DIR="$SCRIPT_DIR/backups"
DB_USER="${DB_USERNAME:-futurusus}"
DB_PASS="${DB_PASSWORD:-Ra4YKew3ZrET82dR}"
DB_NAME="${DB_DATABASE:-futurusus}"

# App prefix from .env (dynamic container/image names)
APP_PREFIX="${NEXT_PUBLIC_APP_NAME:-futurus}"
APP_PREFIX_LOWER=$(echo "$APP_PREFIX" | tr '[:upper:]' '[:lower:]')

# Container names (production)
C_DB="${APP_PREFIX}-db"
C_BACKEND="${APP_PREFIX}-backend"
C_FRONTEND="${APP_PREFIX}-frontend"
C_ADMIN="${APP_PREFIX}-admin"
C_PGADMIN="${APP_PREFIX}-pgadmin"

# Image names for production
IMG_BACKEND="${APP_PREFIX_LOWER}/backend:production"
IMG_FRONTEND="${APP_PREFIX_LOWER}/frontend:production"
IMG_ADMIN="${APP_PREFIX_LOWER}/admin:production"
IMG_POSTGRES="postgres:15-alpine"
IMG_PGADMIN="dpage/pgadmin4:latest"

mkdir -p "$EXPORT_DIR" "$BACKUP_DIR"

echo -e "${P}"
cat <<'BANNER'
  _____ _   _ _____ _   _ ____  _   _ ____
 |  ___| | | |_   _| | | |  _ \| | | / ___|
 | |_  | | | | | | | | | | |_) | | | \___ \
 |  _| | |_| | | | | |_| |  _ <| |_| |___) |
 |_|    \___/  |_|  \___/|_| \_\\___/|____/
      SUPER UPLOAD & DEPLOY  -  PRODUCTION
BANNER
echo -e "${N}"

# Check sshpass availability
if command -v sshpass >/dev/null 2>&1; then
  echo -e "  ${G}[installed]${N} sshpass detected"
else
  echo -e "  ${R}[not installed]${N} sshpass is ${Y}REQUIRED${N} for SSH password authentication"
  echo -e "                 Install it with: ${C}sudo apt install sshpass${N}"
  echo -e "                 (You can skip this if you will use SSH key authentication)"
fi
echo

#==============================================================================
# 1. Build platform
#==============================================================================
print_header "1. BUILD PLATFORM"
echo "  1) linux/amd64  (most servers / VPS)"
echo "  2) linux/arm64  (Apple Silicon / ARM servers)"
PLAT_CHOICE=$(ask_def "Select platform" "1")
case "$PLAT_CHOICE" in
  2) PLATFORM="linux/arm64" ;;
  *) PLATFORM="linux/amd64" ;;
esac
print_info "Platform: $PLATFORM"

#==============================================================================
# 2. Port configuration
#==============================================================================
print_header "2. PORT CONFIGURATION"
BACKEND_PORT=$(ask_def  "Backend  port" "${BACKEND_PORT:-3302}")
ADMIN_PORT=$(ask_def    "Admin    port" "${ADMIN_PORT:-3301}")
FRONTEND_PORT=$(ask_def "Frontend port" "${FRONTEND_PORT:-3300}")
POSTGRES_PORT=$(ask_def "Postgres port" "${POSTGRES_PORT:-15432}")
PGADMIN_PORT=$(ask_def  "pgAdmin  port" "${PGADMIN_PORT:-5051}")
export BACKEND_PORT ADMIN_PORT FRONTEND_PORT POSTGRES_PORT PGADMIN_PORT

# App name, coin name and version (from .env, needed for build args)
APP_NAME="${NEXT_PUBLIC_APP_NAME:-Futurus}"
COIN_NAME="${NEXT_PUBLIC_COIN_NAME:-Futurus Coin}"
APP_VERSION="${NEXT_PUBLIC_APP_VERSION:-3.0.0}"

#==============================================================================
# 3. Local cleanup
#==============================================================================
print_header "3. LOCAL CLEANUP (optional)"
if ask_yn "Remove OLD local Futurus docker images?"; then
  print_step "Removing old images..."
  docker images --format '{{.Repository}}:{{.Tag}}' | grep -E "^${APP_PREFIX_LOWER}/" | xargs -r docker rmi -f || true
  print_success "Old images removed"
fi
if ask_yn "Remove OLD local volumes (deletes local DB + uploads)?"; then
  print_step "Stopping any running stacks..."
  docker compose -f docker-compose.yml down -v 2>/dev/null || true
  print_success "Volumes removed"
fi

#==============================================================================
# 4. Build production images
#==============================================================================
print_header "4. BUILD PRODUCTION IMAGES"

# Generate a temporary production docker-compose for building
COMPOSE_PROD="$EXPORT_DIR/docker-compose.build.yml"

cat > "$COMPOSE_PROD" <<BUILD_EOF
services:
  db:
    image: ${IMG_POSTGRES}
    container_name: ${C_DB}

  backend:
    build:
      context: ${SCRIPT_DIR}/backend
      dockerfile: Dockerfile
    image: ${IMG_BACKEND}
    container_name: ${C_BACKEND}

  frontend:
    build:
      context: ${SCRIPT_DIR}/frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:${BACKEND_PORT}
        NEXT_PUBLIC_APP_NAME: ${APP_NAME}
        NEXT_PUBLIC_COIN_NAME: ${COIN_NAME}
        NEXT_PUBLIC_APP_VERSION: ${APP_VERSION}
    image: ${IMG_FRONTEND}
    container_name: ${C_FRONTEND}

  admin:
    build:
      context: ${SCRIPT_DIR}/admin
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:${BACKEND_PORT}
        NEXT_PUBLIC_APP_NAME: ${APP_NAME}
        NEXT_PUBLIC_COIN_NAME: ${COIN_NAME}
        NEXT_PUBLIC_APP_VERSION: ${APP_VERSION}
    image: ${IMG_ADMIN}
    container_name: ${C_ADMIN}
BUILD_EOF

print_step "Building images for $PLATFORM (this can take 10-15 min)..."
DOCKER_DEFAULT_PLATFORM="$PLATFORM" docker compose -f "$COMPOSE_PROD" build --pull
print_success "Images built"

#==============================================================================
# 5. Database backup + storage bundle
#==============================================================================
print_header "5. DATABASE BACKUP + STORAGE BUNDLE"
TS=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/futurus_backup_${TS}.sql.gz"
if docker ps --format '{{.Names}}' | grep -qE "^${C_DB}$"; then
  print_step "Dumping local DB (${C_DB}) -> $DB_BACKUP"
  docker exec -e PGPASSWORD="$DB_PASS" "$C_DB" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$DB_BACKUP"
  print_success "DB dump done ($(du -h "$DB_BACKUP" | cut -f1))"
else
  print_warning "No local postgres container running — skipping DB dump"
  DB_BACKUP=""
fi

STORAGE_BUNDLE="$EXPORT_DIR/storage_${TS}.tar.gz"
if [ -d "$SCRIPT_DIR/backend/uploads" ]; then
  print_step "Bundling backend/uploads -> $STORAGE_BUNDLE"
  tar -C "$SCRIPT_DIR/backend" -czf "$STORAGE_BUNDLE" uploads || true
  print_success "Storage bundled ($(du -h "$STORAGE_BUNDLE" | cut -f1))"
else
  print_warning "No uploads/ directory to bundle"
  STORAGE_BUNDLE=""
fi

#==============================================================================
# 6. Export & compress images
#==============================================================================
print_header "6. EXPORT & COMPRESS IMAGES"
IMG_TAR="$EXPORT_DIR/futurus_images_${TS}.tar"
print_step "Saving docker images -> $IMG_TAR"
docker save -o "$IMG_TAR" "$IMG_BACKEND" "$IMG_FRONTEND" "$IMG_ADMIN" "$IMG_POSTGRES" "$IMG_PGADMIN" \
  || { print_error "docker save failed (some images missing?)"; exit 1; }
print_step "Compressing -> ${IMG_TAR}.gz"
gzip -f "$IMG_TAR"
IMG_TAR_GZ="${IMG_TAR}.gz"
print_success "Images bundle: $(du -h "$IMG_TAR_GZ" | cut -f1)"

#==============================================================================
# 7. Server configuration
#==============================================================================
print_header "7. SERVER CONFIGURATION"
prompt_server_config() {
  SERVER_IP=$(ask_def     "Remote host (IP or hostname)" "${SERVER_IP:-}")
  [ -z "$SERVER_IP" ] && { print_error "Host required"; exit 1; }
  SSH_PORT=$(ask_def      "SSH port" "${SSH_PORT:-22}")
  SERVER_USER=$(ask_def   "SSH username" "${SERVER_USER:-root}")
  SERVER_PATH=$(ask_def   "Remote install path" "${SERVER_PATH:-/www/wwwroot/yourdomain}")
  echo "  1) SSH password"
  echo "  2) SSH key file"
  AUTH_METHOD=$(ask_def "Auth method" "1")
  if [ "$AUTH_METHOD" = "2" ]; then
    while :; do
      SSH_KEY_PATH=$(ask_def "Path to SSH key" "${SSH_KEY_PATH:-$HOME/.ssh/id_rsa}")
      [ -f "$SSH_KEY_PATH" ] && break
      print_error "Key not found: $SSH_KEY_PATH"
    done
    chmod 600 "$SSH_KEY_PATH" || true
    SSH_PASS=""
  else
    SSH_KEY_PATH=""
    read -rsp "SSH password: " SSH_PASS; echo
    [ -z "$SSH_PASS" ] && { print_error "Password required"; exit 1; }
    command -v sshpass >/dev/null || { print_error "sshpass not installed (sudo apt install sshpass)"; exit 1; }
  fi
}
prompt_server_config

ssh_opts() {
  local opts="-o StrictHostKeyChecking=no -o ConnectTimeout=10 -p $SSH_PORT"
  [ -n "$SSH_KEY_PATH" ] && opts="$opts -i $SSH_KEY_PATH"
  echo "$opts"
}
ssh_pre() { [ -n "$SSH_PASS" ] && echo "sshpass -p $(printf %q "$SSH_PASS")"; }
rssh()    { eval "$(ssh_pre) ssh $(ssh_opts) ${SERVER_USER}@${SERVER_IP} \"\$@\""; }
rscp()    { eval "$(ssh_pre) scp $(ssh_opts | sed 's/-p /-P /') $1 ${SERVER_USER}@${SERVER_IP}:$2"; }

#==============================================================================
# 8. Test connection
#==============================================================================
print_header "8. TEST SSH CONNECTION"
while :; do
  if rssh "echo OK" >/dev/null 2>&1; then print_success "SSH OK"; break
  else print_error "SSH connection failed"
       ask_yn "Re-enter server config?" "y" && prompt_server_config || exit 1
  fi
done

#==============================================================================
# 9. Detect sudo requirement
#==============================================================================
print_header "9. SUDO DETECTION"
NEED_SUDO=false; SUDO_PASS=""
if rssh "docker ps" >/dev/null 2>&1; then
  print_success "User can run docker without sudo"
else
  print_warning "Docker requires sudo on remote"
  NEED_SUDO=true
  if [ -n "$SSH_PASS" ] && ask_yn "Use SSH password as sudo password?" "y"; then
    SUDO_PASS="$SSH_PASS"
  else
    read -rsp "Sudo password: " SUDO_PASS; echo
  fi
  if rssh "echo $(printf %q "$SUDO_PASS") | sudo -S -p '' docker ps" >/dev/null 2>&1; then
    print_success "Sudo OK"
  else
    print_error "Sudo failed"; exit 1
  fi
fi

# Wrapper that prepends sudo when needed
rsudo() {
  local cmd="$*"
  if $NEED_SUDO; then
    rssh "echo $(printf %q "$SUDO_PASS") | sudo -S -p '' bash -lc $(printf %q "$cmd")"
  else
    rssh "$cmd"
  fi
}

#==============================================================================
# 10. Remote cleanup
#==============================================================================
print_header "10. REMOTE CLEANUP"
print_step "Listing existing Futurus containers..."
EXIST=$(rsudo "docker ps -a --format '{{.Names}}' | grep -E '^${APP_PREFIX}-' || true")
if [ -n "$EXIST" ]; then
  echo "$EXIST"
  if ask_yn "Stop & remove these containers?" "y"; then
    rsudo "docker ps -a --format '{{.Names}}' | grep -E '^${APP_PREFIX}-' | xargs -r docker rm -f"
    print_success "Containers removed"
  fi
fi
if ask_yn "Remove OLD remote Futurus images?"; then
  rsudo "docker images --format '{{.Repository}}:{{.Tag}}' | grep -E '^${APP_PREFIX_LOWER}/' | xargs -r docker rmi -f || true"
  print_success "Old images removed"
fi
if ask_yn "Remove OLD remote volumes (DB data)?"; then
  print_warning "This will PERMANENTLY delete the remote database!"
  if ask_yn "Backup the remote database before removing?" "y"; then
    REMOTE_TS=$(date +%Y%m%d_%H%M%S)
    REMOTE_BK_NAME="db_pre_deploy_${REMOTE_TS}.sql.gz"
    print_step "Dumping remote DB before removal..."
    REMOTE_DB_CONTAINER=$(rsudo "docker ps --format '{{.Names}}' | grep -E '${APP_PREFIX}.*(db|postgres)' | head -1" 2>/dev/null || true)
    if [ -n "$REMOTE_DB_CONTAINER" ]; then
      REMOTE_DB_PASS=$(rsudo "docker exec $REMOTE_DB_CONTAINER printenv POSTGRES_PASSWORD" 2>/dev/null || echo "$DB_PASS")
      rsudo "docker exec -e PGPASSWORD=$REMOTE_DB_PASS $REMOTE_DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --clean --if-exists | gzip > /tmp/$REMOTE_BK_NAME"
      mkdir -p "$BACKUP_DIR"
      eval "$(ssh_pre) scp $(ssh_opts | sed 's/-p /-P /') ${SERVER_USER}@${SERVER_IP}:/tmp/$REMOTE_BK_NAME $BACKUP_DIR/$REMOTE_BK_NAME"
      rsudo "rm -f /tmp/$REMOTE_BK_NAME"
      print_success "Remote DB saved locally: $BACKUP_DIR/$REMOTE_BK_NAME ($(du -h "$BACKUP_DIR/$REMOTE_BK_NAME" | cut -f1))"
    else
      print_warning "No remote postgres container found — cannot backup"
    fi
  fi
  rsudo "docker volume ls --format '{{.Name}}' | grep -iE '${APP_PREFIX_LOWER}|postgres' | xargs -r docker volume rm -f || true"
  print_success "Old volumes removed"
fi

#==============================================================================
# 11. Generate compose + .env + management scripts in EXPORT_DIR
#==============================================================================
print_header "11. GENERATE REMOTE FILES"

JWT_SECRET_NEW=$(openssl rand -base64 32 2>/dev/null || dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | head -c 44)
NEXTAUTH_SECRET_NEW=$(openssl rand -base64 32 2>/dev/null || dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | head -c 44)
AUTH_SECRET_NEW=$(openssl rand -base64 32 2>/dev/null || dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | head -c 44)
NEW_DB_PASS=$(openssl rand -hex 16 2>/dev/null || dd if=/dev/urandom bs=16 count=1 2>/dev/null | xxd -p)
DOMAIN_DEFAULT="$(basename "$SERVER_PATH")"

# APP_NAME, COIN_NAME, APP_VERSION already defined in step 2

# Ask for domain-based HTTPS URLs or fall back to IP:port HTTP
echo
print_info "Configure API URLs for the remote .env"
echo "  1) HTTPS with custom domain  (e.g. api.${DOMAIN_DEFAULT})"
echo "  2) HTTP with IP:port         (e.g. http://${SERVER_IP}:${BACKEND_PORT})"
URL_MODE=$(ask_def "URL mode" "1")
if [ "$URL_MODE" = "1" ]; then
  API_DOMAIN=$(ask_def "API domain (no https://)" "api.${DOMAIN_DEFAULT}")
  FRONT_DOMAIN=$(ask_def "Frontend domain" "${DOMAIN_DEFAULT}")
  ADMIN_DOMAIN=$(ask_def "Admin domain" "admin.${DOMAIN_DEFAULT}")
  PUB_API_URL="https://${API_DOMAIN}"
  PUB_FRONTEND="https://${FRONT_DOMAIN}"
  PUB_ADMIN="https://${ADMIN_DOMAIN}"
  CORS_VAL="https://${FRONT_DOMAIN},https://${ADMIN_DOMAIN},https://${API_DOMAIN},http://${FRONT_DOMAIN},http://${ADMIN_DOMAIN},http://${SERVER_IP}:${FRONTEND_PORT},http://${SERVER_IP}:${ADMIN_PORT},http://${SERVER_IP}:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_PORT},http://localhost:${BACKEND_PORT}"
else
  PUB_API_URL="http://${SERVER_IP}:${BACKEND_PORT}"
  PUB_FRONTEND="http://${SERVER_IP}:${FRONTEND_PORT}"
  PUB_ADMIN="http://${SERVER_IP}:${ADMIN_PORT}"
  CORS_VAL="http://${SERVER_IP}:${FRONTEND_PORT},http://${SERVER_IP}:${ADMIN_PORT},http://${SERVER_IP}:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_PORT},http://localhost:${BACKEND_PORT}"
fi

# Read Solana config from root .env
SOLANA_RPC="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"
SOLANA_CLUSTER_VAL="${SOLANA_CLUSTER:-devnet}"
PREDICTION_PID="${PREDICTION_PROGRAM_ID:-}"
FUT_MINT_VAL="${FUT_MINT:-}"
FEE_AUTH_PUB="${FEE_AUTHORITY_PUBLIC_KEY:-}"
FEE_AUTH_PRIV="${FEE_AUTHORITY_PRIVATE_KEY:-}"
WALLET_ENC="${WALLET_ENCRYPTION_KEY:-}"

cat > "$EXPORT_DIR/.env" <<ENV_EOF
# ─── App ─────────────────────────────────────────────────────────────────────
NODE_ENV=production
NEXT_PUBLIC_APP_NAME="${APP_NAME}"
NEXT_PUBLIC_COIN_NAME="${COIN_NAME}"
NEXT_PUBLIC_APP_VERSION="${APP_VERSION}"
PUBLIC_APP_VERSION="${APP_VERSION}"
NEXT_PUBLIC_APP_VERSION="1.1.2-$(date +%d%m%Y-%H:%M)"

# ─── Server ──────────────────────────────────────────────────────────────────
SERVER_IP=${SERVER_IP}
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
ADMIN_PORT=${ADMIN_PORT}
POSTGRES_PORT=${POSTGRES_PORT}
PGADMIN_PORT=${PGADMIN_PORT}

# ─── Database ────────────────────────────────────────────────────────────────
DB_USERNAME=${DB_USER}
DB_PASSWORD=${NEW_DB_PASS}
DB_DATABASE=${DB_NAME}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${NEW_DB_PASS}
POSTGRES_DB=${DB_NAME}
DATABASE_URL=postgresql://${DB_USER}:${NEW_DB_PASS}@db:5432/${DB_NAME}?schema=public

# ─── Auth & Security ────────────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET_NEW}
NEXTAUTH_SECRET=${NEXTAUTH_SECRET_NEW}
AUTH_SECRET=${AUTH_SECRET_NEW}
AUTH_TRUST_HOST=true
NEXTAUTH_URL=${PUB_FRONTEND}

# ─── URLs ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=${PUB_API_URL}
INTERNAL_API_URL=http://backend:3001
FRONTEND_URL=${PUB_FRONTEND}
ADMIN_URL=${PUB_ADMIN}
CORS_ORIGINS=${CORS_VAL}

# ─── Solana Blockchain ───────────────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_RPC_URL="${SOLANA_RPC}"
NEXT_PUBLIC_SOLANA_CLUSTER="${SOLANA_CLUSTER_VAL}"
NEXT_PUBLIC_PREDICTION_PROGRAM_ID="${PREDICTION_PID}"
NEXT_PUBLIC_FUT_MINT="${FUT_MINT_VAL}"
SOLANA_RPC_URL="${SOLANA_RPC}"
SOLANA_CLUSTER="${SOLANA_CLUSTER_VAL}"
PREDICTION_PROGRAM_ID="${PREDICTION_PID}"
FUT_MINT="${FUT_MINT_VAL}"
FEE_AUTHORITY_PUBLIC_KEY="${FEE_AUTH_PUB}"
FEE_AUTHORITY_PRIVATE_KEY="${FEE_AUTH_PRIV}"
WALLET_ENCRYPTION_KEY="${WALLET_ENC}"

# ─── pgAdmin ────────────────────────────────────────────────────────────────
PGADMIN_DEFAULT_EMAIL=admin@${DOMAIN_DEFAULT}
PGADMIN_DEFAULT_PASSWORD=${NEW_DB_PASS}
ENV_EOF

cat > "$EXPORT_DIR/docker-compose.yml" <<COMPOSE_EOF
services:
  db:
    image: ${IMG_POSTGRES}
    container_name: ${C_DB}
    restart: unless-stopped
    env_file: [.env]
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    ports: ["\${POSTGRES_PORT:-5432}:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    networks: [app-network]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    image: ${IMG_BACKEND}
    container_name: ${C_BACKEND}
    restart: unless-stopped
    env_file: [.env]
    ports: ["\${BACKEND_PORT:-3302}:3001"]
    depends_on:
      db: { condition: service_healthy }
    volumes:
      - ./backend/uploads:/app/uploads
    networks: [app-network]

  frontend:
    image: ${IMG_FRONTEND}
    container_name: ${C_FRONTEND}
    restart: unless-stopped
    env_file: [.env]
    ports: ["\${FRONTEND_PORT:-3300}:3000"]
    depends_on: [backend]
    networks: [app-network]

  admin:
    image: ${IMG_ADMIN}
    container_name: ${C_ADMIN}
    restart: unless-stopped
    env_file: [.env]
    ports: ["\${ADMIN_PORT:-3301}:3002"]
    depends_on: [backend]
    networks: [app-network]

  pgadmin:
    image: ${IMG_PGADMIN}
    container_name: ${C_PGADMIN}
    restart: unless-stopped
    env_file: [.env]
    environment:
      PGADMIN_DEFAULT_EMAIL: \${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: \${PGADMIN_DEFAULT_PASSWORD}
    ports: ["\${PGADMIN_PORT:-5050}:80"]
    volumes: [pgadmin_data:/var/lib/pgadmin]
    networks: [app-network]

networks:
  app-network:
    driver: bridge

volumes:
  postgres_data:
  pgadmin_data:
COMPOSE_EOF

# Management scripts (executed on remote)
SUDO_PREFIX=""; $NEED_SUDO && SUDO_PREFIX="sudo "
cat > "$EXPORT_DIR/start.sh" <<S; chmod +x "$EXPORT_DIR/start.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose up -d
S
cat > "$EXPORT_DIR/stop.sh" <<S; chmod +x "$EXPORT_DIR/stop.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose down
S
cat > "$EXPORT_DIR/restart.sh" <<S; chmod +x "$EXPORT_DIR/restart.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose restart
S
cat > "$EXPORT_DIR/logs.sh" <<S; chmod +x "$EXPORT_DIR/logs.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose logs -f \${1:-}
S
cat > "$EXPORT_DIR/status.sh" <<S; chmod +x "$EXPORT_DIR/status.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose ps
echo; echo "=== health ==="
for p in ${BACKEND_PORT} ${FRONTEND_PORT} ${ADMIN_PORT}; do
  curl -s -o /dev/null -w "port \$p: %{http_code}\n" "http://localhost:\$p" || true
done
S
cat > "$EXPORT_DIR/backup.sh" <<S; chmod +x "$EXPORT_DIR/backup.sh"
#!/bin/bash
set -e; cd "\$(dirname "\$0")"; . ./.env
TS=\$(date +%Y%m%d_%H%M%S); mkdir -p backups
${SUDO_PREFIX}docker exec -e PGPASSWORD="\$POSTGRES_PASSWORD" ${C_DB} \
  pg_dump -U "\$POSTGRES_USER" -d "\$POSTGRES_DB" --clean --if-exists | gzip > backups/db_\$TS.sql.gz
echo "Backup saved: backups/db_\$TS.sql.gz"
S
cat > "$EXPORT_DIR/restore.sh" <<S; chmod +x "$EXPORT_DIR/restore.sh"
#!/bin/bash
set -e; cd "\$(dirname "\$0")"; . ./.env
[ -z "\${1:-}" ] && { echo "Usage: \$0 <backup.sql.gz>"; ls backups/*.sql.gz 2>/dev/null; exit 1; }
gunzip -c "\$1" | ${SUDO_PREFIX}docker exec -i -e PGPASSWORD="\$POSTGRES_PASSWORD" ${C_DB} psql -U "\$POSTGRES_USER" -d "\$POSTGRES_DB" >/dev/null
echo "Restored from \$1"
S
print_success "Files generated in $EXPORT_DIR"
ls -la "$EXPORT_DIR"

#==============================================================================
# 12. Upload to remote
#==============================================================================
print_header "12. UPLOAD"
print_step "Ensuring remote dir exists: $SERVER_PATH"
rsudo "mkdir -p $SERVER_PATH/backups $SERVER_PATH/backend/uploads/{markets,images,verify,support,documents,blogs} && chown -R ${SERVER_USER}:${SERVER_USER} $SERVER_PATH 2>/dev/null || true"

print_step "Uploading images bundle ($(du -h "$IMG_TAR_GZ" | cut -f1))..."
rscp "$IMG_TAR_GZ" "$SERVER_PATH/"

if [ -n "$STORAGE_BUNDLE" ] && [ -f "$STORAGE_BUNDLE" ]; then
  print_step "Uploading storage bundle ($(du -h "$STORAGE_BUNDLE" | cut -f1))..."
  rscp "$STORAGE_BUNDLE" "$SERVER_PATH/"
fi
if [ -n "$DB_BACKUP" ] && [ -f "$DB_BACKUP" ]; then
  print_step "Uploading DB backup..."
  rscp "$DB_BACKUP" "$SERVER_PATH/backups/"
fi

print_step "Uploading compose + .env + scripts..."
for f in docker-compose.yml .env start.sh stop.sh restart.sh logs.sh status.sh backup.sh restore.sh; do
  rscp "$EXPORT_DIR/$f" "$SERVER_PATH/"
done

#==============================================================================
# 13. Load images & start on remote
#==============================================================================
print_header "13. START STACK ON REMOTE"
print_step "Loading docker images on remote..."
rsudo "cd $SERVER_PATH && gunzip -c $(basename "$IMG_TAR_GZ") | docker load"

if [ -n "$STORAGE_BUNDLE" ] && [ -f "$STORAGE_BUNDLE" ]; then
  print_step "Extracting storage bundle..."
  rsudo "mkdir -p $SERVER_PATH/backend/uploads && cd $SERVER_PATH && tar -xzf $(basename "$STORAGE_BUNDLE") -C backend/"
fi

print_step "Starting docker compose..."
rsudo "cd $SERVER_PATH && docker compose up -d"

print_step "Waiting for postgres health..."
for i in $(seq 1 30); do
  if rsudo "docker exec ${C_DB} pg_isready -U ${DB_USER}" >/dev/null 2>&1; then
    print_success "Postgres ready"; break
  fi
  if [ "$i" -eq 30 ]; then
    print_error "Postgres did not become healthy in 60s"
  fi
  sleep 2
done

print_step "Running prisma migrate deploy..."
rsudo "docker exec -t ${C_BACKEND} npx prisma migrate deploy" || print_warning "migrate had issues"

print_step "Ensuring all tables exist (prisma db push)..."
rsudo "docker exec -t ${C_BACKEND} npx prisma db push --accept-data-loss" || print_warning "db push had issues"

print_step "Generating Prisma Client..."
rsudo "docker exec -t ${C_BACKEND} npx prisma generate" || print_warning "prisma generate had issues"

print_step "Restarting backend after schema sync..."
rsudo "docker restart ${C_BACKEND}"
sleep 5

print_step "Creating upload directories on remote..."
rsudo "mkdir -p $SERVER_PATH/backend/uploads/markets $SERVER_PATH/backend/uploads/images $SERVER_PATH/backend/uploads/verify $SERVER_PATH/backend/uploads/support $SERVER_PATH/backend/uploads/documents $SERVER_PATH/backend/uploads/blogs"
print_success "Upload directories ready (bind-mounted into container)"

print_step "Seeding database..."
rsudo "docker exec -t ${C_BACKEND} npx prisma db seed" || print_warning "seed had issues"

#── Database Configuration (same as setup-futurus.sh) ──────────────────────────
PG_EXEC="docker exec -e PGPASSWORD=${NEW_DB_PASS} ${C_DB} psql -h localhost -U ${DB_USER} -d ${DB_NAME} -c"

print_step "Configuring Brazilian Portuguese language..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"Language\\\" (name, code, \\\"isDefault\\\", \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES ('Portuguese', 'pt_br', 1, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET \\\"isDefault\\\" = 1;
UPDATE \\\"Language\\\" SET \\\"isDefault\\\" = 0 WHERE code != 'pt_br';
\"" || print_warning "Language config had issues"

print_step "Ensuring referral_code column exists..."
rsudo "$PG_EXEC \"
DO \\\$\\\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'referralCode') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN \\\"referralCode\\\" VARCHAR(40) UNIQUE;
    END IF;
END
\\\$\\\$;
UPDATE \\\"User\\\" SET \\\"referralCode\\\" = UPPER(SUBSTRING(username, 1, 6)) || LPAD(id::text, 4, '0') WHERE \\\"referralCode\\\" IS NULL;
\"" || print_warning "referral_code had issues"

print_step "Ensuring CPF column exists..."
rsudo "$PG_EXEC \"
DO \\\$\\\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'cpf') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN cpf VARCHAR(20);
    END IF;
END
\\\$\\\$;
\"" || print_warning "CPF column had issues"

print_step "Ensuring member_chosen_outcome column exists..."
rsudo "$PG_EXEC \"
DO \\\$\\\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'group_members' AND column_name = 'member_chosen_outcome') THEN
        ALTER TABLE group_members ADD COLUMN member_chosen_outcome VARCHAR(10);
    END IF;
END
\\\$\\\$;
\"" || print_warning "member_chosen_outcome had issues"

print_step "Ensuring 2FA columns exist..."
rsudo "$PG_EXEC \"
DO \\\$\\\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'ts') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN ts INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'tv') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN tv INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'tsc') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN tsc VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'twoFactorRecoveryCodes') THEN
        ALTER TABLE \\\"User\\\" ADD COLUMN \\\"twoFactorRecoveryCodes\\\" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'ts') THEN
        ALTER TABLE \\\"Admin\\\" ADD COLUMN ts INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'tv') THEN
        ALTER TABLE \\\"Admin\\\" ADD COLUMN tv INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'tsc') THEN
        ALTER TABLE \\\"Admin\\\" ADD COLUMN tsc VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Admin' AND column_name = 'twoFactorRecoveryCodes') THEN
        ALTER TABLE \\\"Admin\\\" ADD COLUMN \\\"twoFactorRecoveryCodes\\\" TEXT;
    END IF;
END
\\\$\\\$;
\"" || print_warning "2FA columns had issues"

print_step "Registering Asaas PIX Gateway (code: 127)..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"Gateway\\\" (code, name, alias, status, \\\"gatewayParameters\\\", \\\"supportedCurrencies\\\", crypto, description, \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES (127, 'Asaas PIX', 'AsaasPix', 1,
  '{\\\"api_key\\\":{\\\"title\\\":\\\"API Key\\\",\\\"global\\\":true,\\\"value\\\":\\\"\\\"},\\\"mode\\\":{\\\"title\\\":\\\"Mode\\\",\\\"global\\\":true,\\\"value\\\":\\\"sandbox\\\"}}',
  '{\\\"BRL\\\":\\\"BRL\\\"}', 0, 'Asaas PIX Payment Gateway', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, alias = EXCLUDED.alias, status = EXCLUDED.status, \\\"updatedAt\\\" = NOW();
\"" || print_warning "PIX gateway had issues"

rsudo "$PG_EXEC \"
INSERT INTO \\\"GatewayCurrency\\\" (name, currency, symbol, \\\"methodCode\\\", \\\"gatewayAlias\\\", \\\"minAmount\\\", \\\"maxAmount\\\", \\\"percentCharge\\\", \\\"fixedCharge\\\", rate, \\\"gatewayParameter\\\", \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES ('Asaas PIX', 'BRL', 'R\\\$', 127, 'AsaasPix', 1.00, 100000.00, 1.50, 0.00, 1.00,
  '{\\\"api_key\\\":\\\"\\\", \\\"mode\\\":\\\"sandbox\\\"}', NOW(), NOW())
ON CONFLICT (\\\"methodCode\\\") DO UPDATE SET name = EXCLUDED.name, \\\"updatedAt\\\" = NOW();
\"" || true

print_step "Registering Asaas Credit Card Gateway (code: 128)..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"Gateway\\\" (code, name, alias, status, \\\"gatewayParameters\\\", \\\"supportedCurrencies\\\", crypto, description, \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES (128, 'Asaas Credit Card', 'AsaasCard', 1,
  '{\\\"api_key\\\":{\\\"title\\\":\\\"API Key\\\",\\\"global\\\":true,\\\"value\\\":\\\"\\\"},\\\"mode\\\":{\\\"title\\\":\\\"Mode\\\",\\\"global\\\":true,\\\"value\\\":\\\"sandbox\\\"}}',
  '{\\\"BRL\\\":\\\"BRL\\\"}', 0, 'Pay with Credit or Debit Card via Asaas', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, alias = EXCLUDED.alias, status = EXCLUDED.status, \\\"updatedAt\\\" = NOW();
\"" || print_warning "Card gateway had issues"

rsudo "$PG_EXEC \"
INSERT INTO \\\"GatewayCurrency\\\" (name, currency, symbol, \\\"methodCode\\\", \\\"gatewayAlias\\\", \\\"minAmount\\\", \\\"maxAmount\\\", \\\"percentCharge\\\", \\\"fixedCharge\\\", rate, \\\"gatewayParameter\\\", \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES ('Asaas Credit Card - BRL', 'BRL', 'R\\\$', 128, 'AsaasCard', 10.00, 50000.00, 3.99, 0.49, 1.00,
  '{\\\"api_key\\\":\\\"\\\", \\\"mode\\\":\\\"sandbox\\\"}', NOW(), NOW())
ON CONFLICT (\\\"methodCode\\\") DO UPDATE SET name = EXCLUDED.name, \\\"updatedAt\\\" = NOW();
\"" || true

print_step "Registering PIX Withdraw Method..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"WithdrawMethod\\\" (id, name, \\\"minLimit\\\", \\\"maxLimit\\\", \\\"fixedCharge\\\", \\\"percentCharge\\\", rate, currency, description, status, \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES (1, 'PIX Withdraw', 10.00, 50000.00, 0.00, 1.00, 1.00, 'BRL',
  'Withdraw via PIX using Asaas.', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, \\\"updatedAt\\\" = NOW();
\"" || print_warning "PIX withdraw had issues"

print_step "Registering Bank Transfer Withdraw Method..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"WithdrawMethod\\\" (id, name, \\\"minLimit\\\", \\\"maxLimit\\\", \\\"fixedCharge\\\", \\\"percentCharge\\\", rate, currency, description, status, \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES (2, 'Bank Transfer', 10.00, 50000.00, 0.00, 1.50, 1.00, 'BRL',
  'Withdraw via bank transfer using Asaas.', 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, \\\"updatedAt\\\" = NOW();
\"" || print_warning "Bank transfer withdraw had issues"

print_step "Creating KYC verification form..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"Form\\\" (act, \\\"formData\\\", \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES ('kyc',
  '{\\\"document_type\\\":{\\\"name\\\":\\\"Tipo de Documento\\\",\\\"label\\\":\\\"document_type\\\",\\\"is_required\\\":\\\"required\\\",\\\"instruction\\\":\\\"Selecione o tipo de documento\\\",\\\"extensions\\\":\\\"\\\",\\\"options\\\":[\\\"Passaporte\\\",\\\"RG\\\",\\\"CNH\\\"],\\\"type\\\":\\\"select\\\",\\\"width\\\":\\\"12\\\"},\\\"document_front\\\":{\\\"name\\\":\\\"Frente do Documento\\\",\\\"label\\\":\\\"document_front\\\",\\\"is_required\\\":\\\"required\\\",\\\"instruction\\\":\\\"Envie uma foto clara da frente do seu documento\\\",\\\"extensions\\\":\\\"jpg,jpeg,png\\\",\\\"options\\\":[],\\\"type\\\":\\\"file\\\",\\\"width\\\":\\\"12\\\"},\\\"document_back\\\":{\\\"name\\\":\\\"Verso do Documento\\\",\\\"label\\\":\\\"document_back\\\",\\\"is_required\\\":\\\"required\\\",\\\"instruction\\\":\\\"Envie uma foto clara do verso do seu documento\\\",\\\"extensions\\\":\\\"jpg,jpeg,png\\\",\\\"options\\\":[],\\\"type\\\":\\\"file\\\",\\\"width\\\":\\\"12\\\"},\\\"selfie\\\":{\\\"name\\\":\\\"Selfie com Documento\\\",\\\"label\\\":\\\"selfie\\\",\\\"is_required\\\":\\\"required\\\",\\\"instruction\\\":\\\"Envie uma selfie segurando seu documento\\\",\\\"extensions\\\":\\\"jpg,jpeg,png\\\",\\\"options\\\":[],\\\"type\\\":\\\"file\\\",\\\"width\\\":\\\"12\\\"},\\\"cpf\\\":{\\\"name\\\":\\\"CPF\\\",\\\"label\\\":\\\"cpf\\\",\\\"is_required\\\":\\\"required\\\",\\\"instruction\\\":\\\"Digite seu CPF (apenas numeros)\\\",\\\"extensions\\\":\\\"\\\",\\\"options\\\":[],\\\"type\\\":\\\"text\\\",\\\"width\\\":\\\"12\\\"}}',
  NOW(), NOW())
ON CONFLICT (act) DO UPDATE SET \\\"formData\\\" = EXCLUDED.\\\"formData\\\", \\\"updatedAt\\\" = NOW();
\"" || print_warning "KYC form had issues"

print_step "Configuring general settings..."
rsudo "$PG_EXEC \"
INSERT INTO \\\"GeneralSetting\\\" (id, \\\"siteName\\\", \\\"logoUrl\\\", \\\"contactEmail\\\", \\\"contactPhone\\\", \\\"contactAddress\\\", \\\"curText\\\", \\\"curSym\\\", \\\"kycVerification\\\", \\\"registration\\\", \\\"createdAt\\\", \\\"updatedAt\\\")
VALUES (1, '${APP_NAME}', NULL, 'contato@futurus.com.br', '+55 11 99500-1234', 'Av. Paulista 3500 CJ.124, Sao Paulo - SP', 'BRL', 'R\\\$', 1, 1, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  \\\"siteName\\\" = COALESCE(NULLIF(\\\"GeneralSetting\\\".\\\"siteName\\\", ''), EXCLUDED.\\\"siteName\\\"),
  \\\"contactEmail\\\" = COALESCE(\\\"GeneralSetting\\\".\\\"contactEmail\\\", EXCLUDED.\\\"contactEmail\\\"),
  \\\"contactPhone\\\" = COALESCE(\\\"GeneralSetting\\\".\\\"contactPhone\\\", EXCLUDED.\\\"contactPhone\\\"),
  \\\"contactAddress\\\" = COALESCE(\\\"GeneralSetting\\\".\\\"contactAddress\\\", EXCLUDED.\\\"contactAddress\\\"),
  \\\"curText\\\" = EXCLUDED.\\\"curText\\\",
  \\\"curSym\\\" = EXCLUDED.\\\"curSym\\\",
  \\\"kycVerification\\\" = EXCLUDED.\\\"kycVerification\\\",
  \\\"updatedAt\\\" = NOW();
\"" || print_warning "General settings had issues"

print_step "Synchronizing database sequences..."
rsudo "$PG_EXEC \"
SELECT setval('\\\"User_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"User\\\"), 1));
SELECT setval('\\\"Market_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Market\\\"), 1));
SELECT setval('\\\"MarketOption_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"MarketOption\\\"), 1));
SELECT setval('\\\"Category_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Category\\\"), 1));
SELECT setval('\\\"Subcategory_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Subcategory\\\"), 1));
SELECT setval('\\\"Purchase_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Purchase\\\"), 1));
SELECT setval('groups_id_seq', COALESCE((SELECT MAX(id) FROM groups), 1));
SELECT setval('group_members_id_seq', COALESCE((SELECT MAX(id) FROM group_members), 1));
SELECT setval('group_transactions_id_seq', COALESCE((SELECT MAX(id) FROM group_transactions), 1));
SELECT setval('group_invitations_id_seq', COALESCE((SELECT MAX(id) FROM group_invitations), 1));
SELECT setval('group_orders_id_seq', COALESCE((SELECT MAX(id) FROM group_orders), 1));
SELECT setval('group_votes_id_seq', COALESCE((SELECT MAX(id) FROM group_votes), 1));
SELECT setval('\\\"NotificationLog_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"NotificationLog\\\"), 1));
SELECT setval('\\\"AdminNotification_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"AdminNotification\\\"), 1));
SELECT setval('\\\"Deposit_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Deposit\\\"), 1));
SELECT setval('\\\"Withdrawal_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Withdrawal\\\"), 1));
SELECT setval('\\\"Transaction_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Transaction\\\"), 1));
SELECT setval('\\\"Comment_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"Comment\\\"), 1));
SELECT setval('\\\"SupportTicket_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"SupportTicket\\\"), 1));
SELECT setval('\\\"SupportMessage_id_seq\\\"', COALESCE((SELECT MAX(id) FROM \\\"SupportMessage\\\"), 1));
\"" 2>/dev/null || print_warning "Sequence sync had issues"
print_success "Database fully configured"

print_step "Health checks..."
sleep 5
for p in $BACKEND_PORT $FRONTEND_PORT $ADMIN_PORT; do
  CODE=$(rsudo "curl -s -o /dev/null -w '%{http_code}' http://localhost:$p" 2>/dev/null || echo "000")
  if [[ "$CODE" =~ ^[23] ]]; then print_success "port $p: $CODE"
  else print_warning "port $p: $CODE"; fi
done

#==============================================================================
# 14. Cleanup
#==============================================================================
print_header "14. CLEANUP"
if ask_yn "Erase REMOTE upload artifacts (image tar + storage tar)?" "y"; then
  rsudo "rm -f $SERVER_PATH/$(basename "$IMG_TAR_GZ")"
  [ -n "$STORAGE_BUNDLE" ] && rsudo "rm -f $SERVER_PATH/$(basename "$STORAGE_BUNDLE")" || true
  print_success "Remote artifacts removed"
fi
if ask_yn "Erase LOCAL .deploy_temp folder?" "y"; then
  rm -rf "$EXPORT_DIR"
  print_success "Local temp removed"
fi

#==============================================================================
# 15. Restore database backup on remote
#==============================================================================
print_header "15. RESTORE DATABASE BACKUP"

if ask_yn "Remove old database on remote server?" ; then
  if ask_yn "Backup the current remote database first?" "y"; then
    REMOTE_TS2=$(date +%Y%m%d_%H%M%S)
    REMOTE_BK2="db_before_restore_${REMOTE_TS2}.sql.gz"
    print_step "Dumping remote DB..."
    rsudo "docker exec -e PGPASSWORD=${NEW_DB_PASS} ${C_DB} pg_dump -U ${DB_USER} -d ${DB_NAME} --clean --if-exists | gzip > $SERVER_PATH/backups/$REMOTE_BK2"
    print_success "Remote DB backed up as $REMOTE_BK2"
  fi
  print_step "Dropping and recreating database schema..."
  rsudo "docker exec -e PGPASSWORD=${NEW_DB_PASS} ${C_DB} psql -U ${DB_USER} -d ${DB_NAME} -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'"
  print_success "Database schema reset"
fi

AVAILABLE_BACKUPS=()
if [ -d "$BACKUP_DIR" ]; then
  while IFS= read -r f; do AVAILABLE_BACKUPS+=("$f"); done < <(ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null || true)
fi
if [ ${#AVAILABLE_BACKUPS[@]} -eq 0 ]; then
  print_info "No local backups found in $BACKUP_DIR — skipping."
else
  if ask_yn "Restore a database backup on remote?"; then
    echo "  Available local backups:"
    for i in "${!AVAILABLE_BACKUPS[@]}"; do
      sz=$(du -h "${AVAILABLE_BACKUPS[$i]}" | cut -f1)
      echo "    $((i+1))) $(basename "${AVAILABLE_BACKUPS[$i]}") ($sz)"
    done
    echo "    0) Skip"
    echo
    RESTORE_CHOICE=$(ask_def "Select backup to restore (0 to skip)" "0")
    if [ "$RESTORE_CHOICE" != "0" ] && [ "$RESTORE_CHOICE" -le "${#AVAILABLE_BACKUPS[@]}" ] 2>/dev/null; then
      SELECTED="${AVAILABLE_BACKUPS[$((RESTORE_CHOICE-1))]}"
      print_step "Uploading $(basename "$SELECTED") to remote..."
      rscp "$SELECTED" "$SERVER_PATH/backups/"
      print_step "Restoring on remote..."
      rsudo "cd $SERVER_PATH && gunzip -c backups/$(basename "$SELECTED") | docker exec -i -e PGPASSWORD=\$(grep POSTGRES_PASSWORD .env | cut -d= -f2-) ${C_DB} psql -U ${DB_USER} -d ${DB_NAME} >/dev/null"
      print_success "Database restored from $(basename "$SELECTED")"
    else
      print_info "Skipping database restore."
    fi
  fi
fi

#==============================================================================
# DONE
#==============================================================================
print_header "DEPLOYMENT COMPLETE"
print_success "Futurus stack deployed to ${SERVER_IP}"
echo
echo -e "${C}Services:${N}"
echo -e "  Frontend:  ${G}http://${SERVER_IP}:${FRONTEND_PORT}${N}"
echo -e "  Backend:   ${G}http://${SERVER_IP}:${BACKEND_PORT}${N}"
echo -e "  Admin:     ${G}http://${SERVER_IP}:${ADMIN_PORT}${N}"
echo -e "  Database:  ${G}${SERVER_IP}:${POSTGRES_PORT}${N}"
echo -e "  pgAdmin:   ${G}http://${SERVER_IP}:${PGADMIN_PORT}${N}"
echo
echo -e "${C}App:${N} ${APP_NAME}"
echo
echo -e "${C}Manage on remote (cd $SERVER_PATH):${N}"
echo "  ./start.sh ./stop.sh ./restart.sh ./logs.sh ./status.sh ./backup.sh ./restore.sh"
echo
print_success "Done!"
