#!/usr/bin/env bash
###############################################################################
# Club de Ofertas - Super Upload & Deploy Script
#
# Interactive end-to-end deployment:
#   1. Choose platform (linux/amd64 or mac arm64)
#   2. Configure ports (backend / admin / frontend / postgres / pgadmin)
#   3. Optional local cleanup (old images / old volumes)
#   4. Build production images locally (docker-compose.production.yml)
#   5. DB backup + bundle uploads/ + public/images/
#   6. Export & compress images to ./.deploy_temp
#   7. Prompt remote SSH config (IP, user, port, key|password, install path)
#   8. Test connection (loop on failure)
#   9. Detect sudo requirement
#  10. Remote cleanup (stop old containers / remove old images / remove old volumes)
#  11. Upload bundle + compose + .env + management scripts (start/stop/backup/restore/...)
#  12. Load images & start stack on remote, run health checks
#  13. Optional cleanup (remote source artifacts / local .deploy_temp)
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

ROOT_ENV="$SCRIPT_DIR/.env"
[ -f "$ROOT_ENV" ] && { set -a; . "$ROOT_ENV"; set +a; }

EXPORT_DIR="$SCRIPT_DIR/.deploy_temp"
BACKUP_DIR="$SCRIPT_DIR/backups"
DB_USER="${POSTGRES_USER:-clubdeofertas}"
DB_PASS="${POSTGRES_PASSWORD:-clubdeofertas123}"
DB_NAME="${POSTGRES_DB:-clubdeofertas}"

# Container names (production)
C_DB="clubdeofertas_postgres"
C_BACKEND="clubdeofertas_backend"
C_FRONTEND="clubdeofertas_frontend"
C_ADMIN="clubdeofertas_admin"
C_PGADMIN="clubdeofertas_pgadmin"

# Image names produced by docker-compose.production.yml build
IMG_BACKEND="clubdeofertas/backend:production"
IMG_FRONTEND="clubdeofertas/frontend:production"
IMG_ADMIN="clubdeofertas/admin:production"
IMG_POSTGRES="postgres:15-alpine"
IMG_PGADMIN="dpage/pgadmin4:latest"

mkdir -p "$EXPORT_DIR" "$BACKUP_DIR"

echo -e "${Y}NOTE:${N} Requires sshpass for password auth (sudo apt install sshpass)"
echo

echo -e "${P}"
cat <<'BANNER'
   ____ _       _       ____  _____   ___  _____ _____ ____ _____ _    ____
  / ___| |_   _| |__   |  _ \| ____| / _ \|  ___| ____|  _ \_   _/ \  / ___|
 | |   | | | | | '_ \  | | | |  _|  | | | | |_  |  _| | |_) || |/ _ \ \___ \
 | |___| | |_| | |_) | | |_| | |___ | |_| |  _| | |___|  _ < | / ___ \ ___) |
  \____|_|\__,_|_.__/  |____/|_____| \___/|_|   |_____|_| \_\|_/_/   \_\____/
       SUPER UPLOAD & DEPLOY  -  PRODUCTION
BANNER
echo -e "${N}"

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
# 2. Local cleanup
#==============================================================================
print_header "2. LOCAL CLEANUP (optional)"
if ask_yn "Remove OLD local Club de Ofertas docker images?"; then
  print_step "Removing old images..."
  docker images --format '{{.Repository}}:{{.Tag}}' | grep -E '^clubdeofertas-(backend|frontend|admin)' | xargs -r docker rmi -f || true
  print_success "Old images removed"
fi
if ask_yn "Remove OLD local volumes (deletes local DB + uploads inside docker)?"; then
  print_step "Stopping any running stacks..."
  docker compose -f docker-compose.production.yml down -v 2>/dev/null || true
  docker compose -f docker-compose.yml             down -v 2>/dev/null || true
  print_success "Volumes removed"
fi

#==============================================================================
# 3. Port configuration
#==============================================================================
print_header "3. PORT CONFIGURATION"
BACKEND_PORT=$(ask_def "Backend  port" "${BACKEND_PORT:-3062}")
ADMIN_PORT=$(ask_def "Admin    port" "${ADMIN_PORT:-3061}")
FRONTEND_PORT=$(ask_def "Frontend port" "${FRONTEND_PORT:-3060}")
POSTGRES_PORT=$(ask_def "Postgres port" "${POSTGRES_PORT:-15432}")
PGADMIN_PORT=$(ask_def "pgAdmin  port" "${PGADMIN_PORT:-5050}")
export BACKEND_PORT ADMIN_PORT FRONTEND_PORT POSTGRES_PORT PGADMIN_PORT

#==============================================================================
# 4. Build production images
#==============================================================================
print_header "4. BUILD PRODUCTION IMAGES"
COMPOSE_PROD="docker-compose.production.yml"
[ -f "$COMPOSE_PROD" ] || { print_error "$COMPOSE_PROD not found"; exit 1; }
print_step "Building images for $PLATFORM (this can take 10-15 min)..."
DOCKER_DEFAULT_PLATFORM="$PLATFORM" docker compose -f "$COMPOSE_PROD" build --pull
print_success "Images built"

#==============================================================================
# 5. Database backup + storage bundle
#==============================================================================
print_header "5. DATABASE BACKUP + STORAGE BUNDLE"
TS=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/clubdeofertas_backup_${TS}.sql.gz"
if docker ps --format '{{.Names}}' | grep -qE "^(clubdeofertas_(dev_)?postgres)$"; then
  RUN_DB=$(docker ps --format '{{.Names}}' | grep -E "^clubdeofertas_(dev_)?postgres$" | head -1)
  print_step "Dumping local DB ($RUN_DB) -> $DB_BACKUP"
  docker exec -e PGPASSWORD="$DB_PASS" "$RUN_DB" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists | gzip > "$DB_BACKUP"
  print_success "DB dump done ($(du -h "$DB_BACKUP" | cut -f1))"
else
  print_warning "No local postgres container — skipping DB dump"
  DB_BACKUP=""
fi

STORAGE_BUNDLE="$EXPORT_DIR/storage_${TS}.tar.gz"
if [ -d "$SCRIPT_DIR/backend/uploads" ] || [ -d "$SCRIPT_DIR/backend/public/images" ]; then
  print_step "Bundling backend/uploads + backend/public/images -> $STORAGE_BUNDLE"
  tar -C "$SCRIPT_DIR/backend" -czf "$STORAGE_BUNDLE" \
    $([ -d "$SCRIPT_DIR/backend/uploads" ]       && echo uploads) \
    $([ -d "$SCRIPT_DIR/backend/public/images" ] && echo public/images) || true
  print_success "Storage bundled ($(du -h "$STORAGE_BUNDLE" | cut -f1))"
else
  print_warning "No uploads/ or public/images/ to bundle"
  STORAGE_BUNDLE=""
fi

#==============================================================================
# 6. Export & compress images
#==============================================================================
print_header "6. EXPORT & COMPRESS IMAGES"
IMG_TAR="$EXPORT_DIR/clubdeofertas_images_${TS}.tar"
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
  SERVER_PATH=$(ask_def   "Remote install path" "${SERVER_PATH:-/www/wwwroot/clubdeofertas.online}")
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
rsync_e() { local e; e="$(ssh_pre) ssh -o StrictHostKeyChecking=no -p $SSH_PORT"
            [ -n "$SSH_KEY_PATH" ] && e="$e -i $SSH_KEY_PATH"; echo "$e"; }

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
  if ask_yn "Use SSH password as sudo password?" "y"; then
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
print_step "Listing existing Club de Ofertas containers..."
EXIST=$(rsudo "docker ps -a --format '{{.Names}}' | grep -E '^clubdeofertas' || true")
if [ -n "$EXIST" ]; then
  echo "$EXIST"
  if ask_yn "Stop & remove these containers?" "y"; then
    rsudo "docker ps -a --format '{{.Names}}' | grep -E '^clubdeofertas' | xargs -r docker rm -f"
    print_success "Containers removed"
  fi
fi
if ask_yn "Remove OLD remote Club de Ofertas images?"; then
  rsudo "docker images --format '{{.Repository}}:{{.Tag}}' | grep -E '^clubdeofertas-(backend|frontend|admin)' | xargs -r docker rmi -f || true"
  print_success "Old images removed"
fi
if ask_yn "Remove OLD remote volumes (DB data)?"; then
  print_warning "This will PERMANENTLY delete the remote database!"
  if ask_yn "Backup the remote database before removing?" "y"; then
    REMOTE_TS=$(date +%Y%m%d_%H%M%S)
    REMOTE_BK_NAME="db_pre_deploy_${REMOTE_TS}.sql.gz"
    print_step "Dumping remote DB before removal..."
    REMOTE_DB_CONTAINER=$(rsudo "docker ps --format '{{.Names}}' | grep -E 'clubdeofertas.*(postgres|db)' | head -1" 2>/dev/null || true)
    if [ -n "$REMOTE_DB_CONTAINER" ]; then
      REMOTE_DB_PASS=$(rsudo "docker exec $REMOTE_DB_CONTAINER printenv POSTGRES_PASSWORD" 2>/dev/null || echo "$DB_PASS")
      rsudo "docker exec -e PGPASSWORD=$REMOTE_DB_PASS $REMOTE_DB_CONTAINER pg_dump -U $DB_USER -d $DB_NAME --clean --if-exists | gzip > /tmp/$REMOTE_BK_NAME"
      mkdir -p "$BACKUP_DIR"
      eval "$(ssh_pre) scp $(ssh_opts | sed 's/-p /-P /') ${REMOTE_USER}@${REMOTE_HOST}:/tmp/$REMOTE_BK_NAME $BACKUP_DIR/$REMOTE_BK_NAME"
      rsudo "rm -f /tmp/$REMOTE_BK_NAME"
      print_success "Remote DB saved locally: $BACKUP_DIR/$REMOTE_BK_NAME ($(du -h "$BACKUP_DIR/$REMOTE_BK_NAME" | cut -f1))"
    else
      print_warning "No remote postgres container found — cannot backup"
    fi
  fi
  rsudo "docker volume ls --format '{{.Name}}' | grep -iE 'clubdeofertas|postgres|pgadmin' | xargs -r docker volume rm -f || true"
  print_success "Old volumes removed"
fi

#==============================================================================
# 11. Generate compose + .env + management scripts in EXPORT_DIR
#==============================================================================
print_header "11. GENERATE REMOTE FILES"

JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | head -c 44)
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64 | head -c 44)
NEW_DB_PASS=$(openssl rand -hex 16 2>/dev/null || dd if=/dev/urandom bs=16 count=1 2>/dev/null | xxd -p)
DOMAIN_DEFAULT="$(basename "$SERVER_PATH")"

# Ask for domain-based HTTPS URLs or fall back to IP:port HTTP
echo
print_info "Configure API URLs for the remote .env"
echo "  1) HTTPS with custom domain  (e.g. api.clubdeofertas.online)"
echo "  2) HTTP with IP:port         (e.g. http://${SERVER_IP}:${BACKEND_PORT})"
URL_MODE=$(ask_def "URL mode" "1")
if [ "$URL_MODE" = "1" ]; then
  API_DOMAIN=$(ask_def "API domain (no https://)" "api.${DOMAIN_DEFAULT}")
  FRONT_DOMAIN=$(ask_def "Frontend domain" "${DOMAIN_DEFAULT}")
  ADMIN_DOMAIN=$(ask_def "Admin domain" "admin.${DOMAIN_DEFAULT}")
  PUB_API_URL="https://${API_DOMAIN}/api"
  PUB_SIMPLE_API="https://${API_DOMAIN}"
  PUB_IMAGE_BASE="https://${API_DOMAIN}/images"
  PUB_FRONTEND="https://${FRONT_DOMAIN}"
  PUB_ADMIN="https://${ADMIN_DOMAIN}"
  CORS_VAL="https://${FRONT_DOMAIN},https://${ADMIN_DOMAIN},https://${API_DOMAIN},http://${FRONT_DOMAIN},http://${ADMIN_DOMAIN},http://${SERVER_IP}:${FRONTEND_PORT},http://${SERVER_IP}:${ADMIN_PORT},http://${SERVER_IP}:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_PORT},http://localhost:${BACKEND_PORT}"
else
  PUB_API_URL="http://${SERVER_IP}:${BACKEND_PORT}/api"
  PUB_SIMPLE_API="http://${SERVER_IP}:${BACKEND_PORT}"
  PUB_IMAGE_BASE="http://${SERVER_IP}:${BACKEND_PORT}/images"
  PUB_FRONTEND="http://${SERVER_IP}:${FRONTEND_PORT}"
  PUB_ADMIN="http://${SERVER_IP}:${ADMIN_PORT}"
  CORS_VAL="http://${SERVER_IP}:${FRONTEND_PORT},http://${SERVER_IP}:${ADMIN_PORT},http://${SERVER_IP}:${BACKEND_PORT},http://localhost:${FRONTEND_PORT},http://localhost:${ADMIN_PORT},http://localhost:${BACKEND_PORT}"
fi

cat > "$EXPORT_DIR/.env" <<ENV_EOF
NODE_ENV=production
SERVER_IP=${SERVER_IP}
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
ADMIN_PORT=${ADMIN_PORT}
POSTGRES_PORT=${POSTGRES_PORT}
PGADMIN_PORT=${PGADMIN_PORT}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${NEW_DB_PASS}
POSTGRES_DB=${DB_NAME}
DATABASE_URL=postgresql://${DB_USER}:${NEW_DB_PASS}@postgres:5432/${DB_NAME}?schema=public
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=24h
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXT_PUBLIC_API_URL=${PUB_API_URL}
NEXT_PUBLIC_SIMPLE_API_URL=${PUB_SIMPLE_API}
NEXT_PUBLIC_IMAGE_BASE_URL=${PUB_IMAGE_BASE}
FRONTEND_URL=${PUB_FRONTEND}
ADMIN_URL=${PUB_ADMIN}
CORS_ORIGINS=${CORS_VAL}
PGADMIN_DEFAULT_EMAIL=admin@${DOMAIN_DEFAULT}
PGADMIN_DEFAULT_PASSWORD=${NEW_DB_PASS}
NEXT_PUBLIC_APP_NAME=Club de Ofertas
NEXT_PUBLIC_APP_VERSION=3.0.0
NEXT_PUBLIC_ZAP_PHONE=595991474601
ENV_EOF

cat > "$EXPORT_DIR/docker-compose.yml" <<COMPOSE_EOF
services:
  postgres:
    image: ${IMG_POSTGRES}
    container_name: ${C_DB}
    restart: unless-stopped
    env_file: [.env]
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    ports: ["${POSTGRES_PORT}:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
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
    ports: ["${BACKEND_PORT}:3002"]
    depends_on:
      postgres: { condition: service_healthy }
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/public/images:/app/public/images

  frontend:
    image: ${IMG_FRONTEND}
    container_name: ${C_FRONTEND}
    restart: unless-stopped
    env_file: [.env]
    ports: ["${FRONTEND_PORT}:3000"]
    depends_on: [backend]

  admin:
    image: ${IMG_ADMIN}
    container_name: ${C_ADMIN}
    restart: unless-stopped
    env_file: [.env]
    ports: ["${ADMIN_PORT}:3000"]
    depends_on: [backend]

  pgadmin:
    image: ${IMG_PGADMIN}
    container_name: ${C_PGADMIN}
    restart: unless-stopped
    env_file: [.env]
    environment:
      PGADMIN_DEFAULT_EMAIL: \${PGADMIN_DEFAULT_EMAIL}
      PGADMIN_DEFAULT_PASSWORD: \${PGADMIN_DEFAULT_PASSWORD}
    ports: ["${PGADMIN_PORT}:80"]
    volumes: [pgadmin_data:/var/lib/pgadmin]

volumes:
  postgres_data:
  pgadmin_data:
COMPOSE_EOF

# Management scripts (executed on remote)
SUDO_PREFIX=""; $NEED_SUDO && SUDO_PREFIX="sudo "
cat > "$EXPORT_DIR/start.sh"   <<S; chmod +x "$EXPORT_DIR/start.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose up -d
S
cat > "$EXPORT_DIR/stop.sh"    <<S; chmod +x "$EXPORT_DIR/stop.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose down
S
cat > "$EXPORT_DIR/restart.sh" <<S; chmod +x "$EXPORT_DIR/restart.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose restart
S
cat > "$EXPORT_DIR/logs.sh"    <<S; chmod +x "$EXPORT_DIR/logs.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose logs -f \${1:-}
S
cat > "$EXPORT_DIR/status.sh"  <<S; chmod +x "$EXPORT_DIR/status.sh"
#!/bin/bash
cd "\$(dirname "\$0")"; ${SUDO_PREFIX}docker compose ps
echo; echo "=== health ==="
for p in ${BACKEND_PORT} ${FRONTEND_PORT} ${ADMIN_PORT}; do
  curl -s -o /dev/null -w "port \$p: %{http_code}\n" "http://localhost:\$p" || true
done
S
cat > "$EXPORT_DIR/backup.sh"  <<S; chmod +x "$EXPORT_DIR/backup.sh"
#!/bin/bash
set -e; cd "\$(dirname "\$0")"; . ./.env
TS=\$(date +%Y%m%d_%H%M%S); mkdir -p backups
${SUDO_PREFIX}docker exec -e PGPASSWORD="\$POSTGRES_PASSWORD" ${C_DB} \
  pg_dump -U "\$POSTGRES_USER" -d "\$POSTGRES_DB" --clean --if-exists | gzip > backups/db_\$TS.sql.gz
echo "backups/db_\$TS.sql.gz"
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
rsudo "mkdir -p $SERVER_PATH/backend/uploads $SERVER_PATH/backend/public/images $SERVER_PATH/backups && chown -R ${SERVER_USER}:${SERVER_USER} $SERVER_PATH 2>/dev/null || true"

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

if [ -n "$STORAGE_BUNDLE" ]; then
  print_step "Extracting storage bundle..."
  rsudo "cd $SERVER_PATH/backend && tar -xzf $SERVER_PATH/$(basename "$STORAGE_BUNDLE")"
fi

print_step "Starting docker compose..."
rsudo "cd $SERVER_PATH && docker compose up -d"

print_step "Waiting for postgres health..."
for i in $(seq 1 30); do
  if rsudo "docker exec ${C_DB} pg_isready -U ${DB_USER}" >/dev/null 2>&1; then
    print_success "Postgres ready"; break
  fi; sleep 2
done

print_step "Running prisma migrate + seed..."
rsudo "docker exec -t ${C_BACKEND} npx prisma migrate deploy" || print_warning "migrate had issues"

if [ -n "$DB_BACKUP" ]; then
  if ask_yn "Restore DB backup on remote (overrides seed)?" "y"; then
    rsudo "gunzip -c $SERVER_PATH/backups/$(basename "$DB_BACKUP") | docker exec -i -e PGPASSWORD=${NEW_DB_PASS} ${C_DB} psql -U ${DB_USER} -d ${DB_NAME}" \
      && print_success "DB restored"
  else
    rsudo "docker exec -t ${C_BACKEND} npm run seed" || print_warning "seed had issues"
  fi
else
  rsudo "docker exec -t ${C_BACKEND} npm run seed" || print_warning "seed had issues"
fi

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
  [ -n "$STORAGE_BUNDLE" ] && rsudo "rm -f $SERVER_PATH/$(basename "$STORAGE_BUNDLE")"
  print_success "Remote artifacts removed"
fi
if ask_yn "Erase LOCAL .deploy_temp folder?" "y"; then
  rm -rf "$EXPORT_DIR"
  print_success "Local temp removed"
fi

#==============================================================================
# 15. Restore a local DB backup on remote?
#==============================================================================
print_header "15. RESTORE DATABASE BACKUP"
AVAILABLE_BACKUPS=()
if [ -d "$BACKUP_DIR" ]; then
  while IFS= read -r f; do AVAILABLE_BACKUPS+=("$f"); done < <(ls -1t "$BACKUP_DIR"/*.sql.gz 2>/dev/null)
fi
if [ ${#AVAILABLE_BACKUPS[@]} -eq 0 ]; then
  print_info "No local backups found in $BACKUP_DIR — skipping."
else
  echo "  Available local backups:"
  for i in "${!AVAILABLE_BACKUPS[@]}"; do
    sz=$(du -h "${AVAILABLE_BACKUPS[$i]}" | cut -f1)
    echo "    $((i+1))) $(basename "${AVAILABLE_BACKUPS[$i]}") ($sz)"
  done
  echo "    0) Skip — do NOT restore any backup"
  echo
  RESTORE_CHOICE=$(ask_def "Select backup to restore on remote (0 to skip)" "0")
  if [ "$RESTORE_CHOICE" != "0" ] && [ "$RESTORE_CHOICE" -le "${#AVAILABLE_BACKUPS[@]}" ] 2>/dev/null; then
    SELECTED="${AVAILABLE_BACKUPS[$((RESTORE_CHOICE-1))]}"
    print_step "Uploading $(basename "$SELECTED") to remote..."
    rscp "$SELECTED" "$SERVER_PATH/backups/"
    print_step "Restoring on remote — this will overwrite current data..."
    rsudo "cd $SERVER_PATH && gunzip -c backups/$(basename "$SELECTED") | docker exec -i -e PGPASSWORD=\$(grep POSTGRES_PASSWORD .env | cut -d= -f2-) ${C_DB} psql -U ${DB_USER} -d ${DB_NAME} >/dev/null"
    print_success "Database restored from $(basename "$SELECTED")"
    print_step "Quick product count check..."
    COUNT=$(rsudo "docker exec ${C_DB} psql -U ${DB_USER} -d ${DB_NAME} -tAc 'SELECT COUNT(*) FROM \"Product\"'" 2>/dev/null || echo "?")
    print_info "Products in DB: $COUNT"
  else
    print_info "Skipping database restore."
  fi
fi

print_header "DONE"
print_success "Stack deployed to ${SERVER_IP}"
echo "  Frontend: http://${SERVER_IP}:${FRONTEND_PORT}"
echo "  Admin:    http://${SERVER_IP}:${ADMIN_PORT}"
echo "  Backend:  http://${SERVER_IP}:${BACKEND_PORT}/api"
echo "  pgAdmin:  http://${SERVER_IP}:${PGADMIN_PORT}"
echo
echo "Manage on remote (cd $SERVER_PATH):"
echo "  ./start.sh ./stop.sh ./restart.sh ./logs.sh ./status.sh ./backup.sh ./restore.sh"
