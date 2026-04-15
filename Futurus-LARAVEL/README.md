# Futurus Brasil

Production-ready Laravel application with Docker deployment.

## Port Configuration

| Environment | Port |
|-------------|------|
| Development | 4444 |
| Production  | 4444 |
| phpMyAdmin  | 4481 |

---

## Quick Start

### Development

```bash
./setup-local.sh
# Access: http://localhost:4444
```

### Production

```bash
./setup-prod.sh
# Access: http://localhost:4444
```

---

## Default Admin Credentials

| Field | Value |
|-------|-------|
| URL | http://localhost:4444/admin |
| Username | `admin` |
| Password | `admin123` |

> **IMPORTANT**: Change the admin password immediately after first login in production!

---

## Project Structure

```
Futurus-LARAVEL/
├── .bin/                    # Deployment package (copy to server)
├── core/                    # Laravel application
├── assets/                  # Static assets
├── SQL/                     # Database initialization
├── backups/                 # Database backups
├── docker-compose.yml       # Development compose
├── docker-compose.prod.yml  # Production compose
├── docker-compose.proxy.yml # Proxy overlay (port 4444)
├── Dockerfile               # Development image
├── Dockerfile.prod          # Production image (optimized)
├── setup-local.sh           # Local development setup
├── setup-prod.sh            # Production setup
├── setup-proxy.sh           # Production with proxy
├── backup.sh                # Database backup script
├── restore.sh               # Database restore script
├── deploy_to_server.sh      # Automated remote deployment
└── .env                     # Environment variables
```

---

## Environment Variables (.env)

```bash
# Database
DB_DATABASE=futurusus
DB_USERNAME=futurusus
DB_PASSWORD=YOUR_SECURE_PASSWORD
DB_ROOT_PASSWORD=YOUR_ROOT_PASSWORD

# phpMyAdmin
PMA_PORT=4481
```

---

## Docker Containers

| Container | Image | Purpose |
|-----------|-------|---------|
| futurus-app-prod | php:8.3-apache | Laravel application |
| futurus-db-prod | mariadb:10.6 | MariaDB database |

---

## Changes Log (2024-03-19)

### Port Changes
- Production port: `8080` → `4444`
- Proxy port: `6070` → `4444`

### Security Improvements
- Removed hardcoded database credentials
- All credentials now from `.env` file
- PHP `expose_php = Off`
- Apache `ServerTokens Prod`
- Apache `ServerSignature Off`
- OPcache enabled for production

### New Files
- `Dockerfile.prod` - Production-optimized Docker image
- `.bin/` folder - Complete deployment package
- `deploy_to_server.sh` - Automated remote server deployment

### Updated Files
- `docker-compose.prod.yml` - Port 4444, env vars, health checks
- `docker-compose.proxy.yml` - Port 4444
- `setup-prod.sh` - Secure credential handling
- `setup-proxy.sh` - Secure credential handling
- `backup.sh` - Production container support, gzip
- `restore.sh` - Production container support, gzip

---

## Server Deployment

### Automated Deployment (Recommended)

#### Install sshpass (for password authentication)

```bash
# macOS
brew install hudochenkov/sshpass/sshpass

# Ubuntu/Debian
sudo apt install sshpass

# CentOS/RHEL
sudo yum install sshpass
```

#### Run Deployment

```bash
./deploy_to_server.sh
```

#### Interactive Prompts

```
Server IP or hostname: 192.168.1.100
SSH Username: root
Remote path (e.g., /var/www/futurus): /var/www/futurus
SSH Password: ********
SSH Port [22]: 22
```

#### Deployment Process (8 Steps)

| Step | Action | Description |
|------|--------|-------------|
| 1 | Server Config | Collect IP, user, path, password |
| 2 | Check Dependencies | Verify Docker, sshpass installed |
| 3 | Test Connection | Validate SSH access to server |
| 4 | Build Images | Build Docker production images locally |
| 5 | Export Data | Save images to .tar.gz, backup database |
| 6 | Prepare Server | Create directories, install Docker if needed |
| 7 | Upload Files | Transfer images, app, configs to server |
| 8 | Deploy | Load images, start containers on server |

#### What Gets Uploaded

```
/var/www/futurus/
├── images/
│   ├── futurus-app.tar.gz    # PHP application image
│   └── mariadb.tar.gz        # Database image
├── core/                      # Laravel application
├── assets/                    # Static files
├── SQL/                       # Database init scripts
├── backups/                   # Database backups
├── docker-compose.yml         # Production compose
├── Dockerfile                 # Production Dockerfile
├── .env                       # Environment config
├── deploy.sh                  # Deploy script
├── backup.sh                  # Backup script
├── restore.sh                 # Restore script
├── stop.sh                    # Stop script
├── logs.sh                    # Logs script
└── status.sh                  # Status script
```

#### After Deployment

```bash
# Access application
http://YOUR_SERVER_IP:4444

# SSH to server for management
ssh user@YOUR_SERVER_IP
cd /var/www/futurus

# Available commands
./status.sh     # Check container status
./logs.sh       # View logs
./backup.sh     # Create database backup
./restore.sh    # Restore database
./stop.sh       # Stop containers
```

#### Requirements

| Location | Requirement |
|----------|-------------|
| Local | Docker |
| Local | sshpass (optional, for password auth) |
| Server | SSH access |
| Server | Docker (auto-installed if missing) |

---

### Method 1: Using .bin Package

The `.bin/` folder contains everything needed for deployment.

#### Step 1: Prepare Server

```bash
# On your server
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

#### Step 2: Copy Files to Server

```bash
# From your local machine
# Option A: Using rsync (recommended)
rsync -avz --progress \
  --exclude 'core/vendor' \
  --exclude 'core/node_modules' \
  --exclude '.git' \
  --exclude 'backups' \
  ./ user@server:/var/www/futurus/

# Option B: Using scp
scp -r .bin/ user@server:/var/www/futurus/
scp -r core/ user@server:/var/www/futurus/
scp -r assets/ user@server:/var/www/futurus/
scp -r SQL/ user@server:/var/www/futurus/
scp index.php .htaccess user@server:/var/www/futurus/
```

#### Step 3: Configure Environment

```bash
# On server
cd /var/www/futurus
cp .env.example .env
nano .env  # Edit with secure credentials
```

#### Step 4: Deploy

```bash
./deploy.sh
```

---

### Method 2: Export Docker Images

If you want to transfer pre-built images:

#### Step 1: Build and Save Images Locally

```bash
# Build production image
docker compose -f docker-compose.prod.yml build

# Save images to tar files
docker save futurus-laravel-app:latest | gzip > futurus-app.tar.gz
docker save mariadb:10.6 | gzip > mariadb.tar.gz
```

#### Step 2: Transfer to Server

```bash
# Copy image files
scp futurus-app.tar.gz mariadb.tar.gz user@server:/var/www/futurus/

# Copy compose and scripts
scp docker-compose.prod.yml user@server:/var/www/futurus/
scp .env.example user@server:/var/www/futurus/
```

#### Step 3: Load Images on Server

```bash
# On server
cd /var/www/futurus
gunzip -c futurus-app.tar.gz | docker load
gunzip -c mariadb.tar.gz | docker load
```

#### Step 4: Start Containers

```bash
cp .env.example .env
nano .env  # Configure credentials
docker compose -f docker-compose.prod.yml up -d
```

---

### Method 3: Export Volumes (Database Migration)

#### Export Database from Local

```bash
# Create backup
./backup.sh
# Creates: backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

#### Transfer Backup

```bash
scp backups/db_backup_*.sql.gz user@server:/var/www/futurus/backups/
```

#### Restore on Server

```bash
# On server
cd /var/www/futurus
./restore.sh backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

### Method 4: Full Volume Export

For complete volume migration including all data:

#### Export Volume

```bash
# Stop containers first
docker compose -f docker-compose.prod.yml stop

# Export database volume
docker run --rm \
  -v futurus-laravel_futurus-db-prod-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-volume.tar.gz -C /data .
```

#### Transfer and Import

```bash
# Transfer
scp db-volume.tar.gz user@server:/var/www/futurus/

# On server - create volume and import
docker volume create futurus-db-data
docker run --rm \
  -v futurus-db-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/db-volume.tar.gz -C /data
```

---

## Deployment Checklist

- [ ] Copy application files to server
- [ ] Configure `.env` with secure credentials
- [ ] Run `./deploy.sh`
- [ ] Verify containers are running: `./status.sh`
- [ ] Test application: `curl http://localhost:4444`
- [ ] Configure firewall (allow port 4444)
- [ ] Setup SSL/reverse proxy (nginx) if needed

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `./deploy_to_server.sh` | **Automated remote deployment** |
| `./setup-prod.sh` | Full production setup (local) |
| `./setup-proxy.sh` | Production with proxy config |
| `./backup.sh` | Create database backup |
| `./restore.sh` | Restore database backup |

### .bin/ Scripts

| Script | Description |
|--------|-------------|
| `./deploy.sh` | Deploy application |
| `./backup.sh` | Create backup |
| `./restore.sh` | Restore backup |
| `./stop.sh` | Stop containers |
| `./logs.sh` | View logs |
| `./status.sh` | Container status |

---

## Troubleshooting

### Check Container Logs

```bash
docker logs futurus-app-prod
docker logs futurus-db-prod
```

### Restart Containers

```bash
docker compose -f docker-compose.prod.yml restart
```

### Rebuild from Scratch

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Fix Permissions

```bash
docker exec futurus-app-prod chown -R www-data:www-data core/storage core/bootstrap/cache
```

---

## Firewall Configuration

```bash
# UFW
sudo ufw allow 4444/tcp

# iptables
sudo iptables -A INPUT -p tcp --dport 4444 -j ACCEPT
```

---

## Nginx Reverse Proxy (Optional)

```nginx
server {
    listen 80;
    server_name futurus-brasil.com;

    location / {
        proxy_pass http://127.0.0.1:4444;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Support

Access: **http://localhost:4444** (or your server IP/domain)
