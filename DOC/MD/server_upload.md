# Server Upload Script Documentation

## Overview

`server_upload.sh` is a comprehensive interactive deployment script for building, packaging, uploading, and deploying the Futurus stack to a remote server.

**Location:** `Futurus-NEXTJS/server_upload.sh`

---

## Features

| Feature | Description |
|---------|-------------|
| Database Backup | Create backup before deployment |
| Port Configuration | Configure ports for all services |
| Clean Docker Images | Remove old Futurus images locally |
| Clean Docker Volumes | Remove old volumes (with confirmation) |
| Multi-Architecture Build | Build for AMD64 or ARM64 (Apple Silicon) |
| Image Compression | Export and compress images for transfer |
| Volume Export | Export database volumes for migration |
| Backup Selection | Include database backup for restore |
| SSH Password Auth | Standard password authentication |
| SSH Key Auth | Amazon EC2 / .pem key file support |
| Remote Installation | Install Docker and deploy on server |
| Laravel Configuration | Auto-configure Laravel environment |
| Debug & Verification | Remote health checks and debugging |

---

## Interactive Steps

### Step 1: Database Backup
```
Do you want to create a database backup before deployment? (y/N)
```
- Creates timestamped backup in `backups/` directory
- Supports both MariaDB/MySQL and PostgreSQL
- Compresses backup with gzip

### Step 2: Port Configuration
```
Port for application [4444]:
Port for database [3306]:
```
- Default app port: `4444`
- Default DB port: `3306`

### Step 3: Clean Old Docker Images
```
Do you want to erase all old Futurus Docker images locally? (y/N)
```
- Removes `futurus-laravel-app:latest`
- Removes `futurus-app:latest`
- Removes all images matching `futurus*`

### Step 4: Clean Old Docker Volumes
```
Do you want to erase all old Futurus Docker volumes locally? (y/N)
Are you absolutely sure? (y/N)
```
- Double confirmation required
- Stops all containers
- Removes all Futurus volumes

### Step 5: Build and Compile
```
Do you want to build and compile the Docker images? (Y/n)
```

#### Step 5.1: Architecture Selection
```
Select target architecture:
  1) Linux AMD64 (Standard servers, AWS, DigitalOcean, etc.)
  2) MacBook M1/M2/M3 (ARM64)
Choose architecture [1]:
```
- AMD64: For standard x86_64 servers
- ARM64: For Apple Silicon Macs

### Step 6: Export and Compress Images
```
Do you want to export and compress Docker images for transfer? (Y/n)
Do you want to also export database volumes (for data migration)? (y/N)
```
- Exports `futurus-laravel-app:latest` to `futurus-app.tar.gz`
- Exports `mariadb:10.6` to `mariadb.tar.gz`
- Optional: Exports database volume to `db-volume.tar.gz`

### Step 7: Restore Database Backup
```
Do you want to include a database backup to restore on the server? (y/N)
Available backups:
  1) futurus_backup_20240321_143000.sql.gz
  2) futurus_backup_20240320_120000.sql.gz
Select backup number (0 to skip):
```
- Lists available backups from `backups/` directory
- Selected backup is included in deployment package

### Step 8: Server Configuration
```
Server IP or hostname:
SSH Username [root]:
Remote installation path [/var/www/futurus]:
SSH Port [22]:
```

### Step 9: SSH Authentication
```
Select authentication method:
  1) SSH Password
  2) SSH Key (Amazon EC2 / .pem file)
Choose method [1]:
```

#### Password Authentication
```
SSH Password: ********
```
- Requires `sshpass` to be installed

#### SSH Key Authentication (Amazon EC2)
```
Path to SSH key file (.pem): /path/to/key.pem
```
- Automatically fixes permissions (`chmod 400`)

### Step 10: Test SSH Connection
- Verifies connection to server before proceeding

### Step 11: Create Server Files
Generates the following files:
- `docker-compose.yml` - Container orchestration
- `.env` - Environment variables with auto-generated passwords
- `start.sh` - Start containers
- `stop.sh` - Stop containers
- `restart.sh` - Restart containers
- `logs.sh` - View container logs
- `status.sh` - Check container status
- `backup.sh` - Create database backup
- `restore.sh` - Restore database backup
- `debug.sh` - Debug information

### Step 12: Upload to Server
```
Ready to upload files to 192.168.1.100. Continue? (Y/n)
```
Uploads:
- Docker images (compressed)
- Configuration files
- SQL initialization files
- Database backups (if selected)
- Volume data (if exported)

### Step 13: Remote Installation
- Installs Docker on server (if not present)
- Loads Docker images from compressed files
- Sets file permissions

### Step 14: Configure Laravel
- Updates Laravel `.env` with database credentials
- Clears application caches
- Generates new `APP_KEY`
- Sets storage permissions
- Restarts application container

### Step 15: Verification and Debug
- Runs `debug.sh` on remote server
- Performs HTTP health check
- Displays container status

### Step 16: Cleanup
```
Do you want to clean up temporary files on the server (image archives)? (y/N)
Do you want to clean up local temporary files? (y/N)
```

---

## Generated Server Scripts

### start.sh
```bash
./start.sh
```
Starts all containers.

### stop.sh
```bash
./stop.sh
```
Stops all containers.

### restart.sh
```bash
./restart.sh
```
Restarts all containers.

### logs.sh
```bash
./logs.sh          # All logs
./logs.sh app      # App logs only
./logs.sh db       # DB logs only
```
View container logs.

### status.sh
```bash
./status.sh
```
Shows container status, HTTP health check, and disk usage.

### backup.sh
```bash
./backup.sh
```
Creates timestamped database backup in `backups/` directory.

### restore.sh
```bash
./restore.sh backups/db_20240321_143000.sql.gz
```
Restores database from backup file.

### debug.sh
```bash
./debug.sh
```
Shows comprehensive debug information:
- Container status
- App container logs
- DB container logs
- HTTP health check
- Laravel .env configuration
- Database connection test

---

## Requirements

### Local Machine
- Docker with buildx support
- `sshpass` (for password authentication)
  ```bash
  # macOS
  brew install hudochenkov/sshpass/sshpass

  # Ubuntu/Debian
  sudo apt install sshpass
  ```

### Remote Server
- SSH access (password or key)
- Docker (auto-installed if missing)
- Ports open: APP_PORT (default 4444), DB_PORT (default 3306)

---

## Usage

```bash
cd Futurus-NEXTJS
./server_upload.sh
```

---

## Output Summary

After successful deployment:

```
==============================================
 DEPLOYMENT COMPLETE!
==============================================

  Status: SUCCESS (HTTP 200)

Access URLs:
  Application:  http://your-server:4444
  Admin Panel:  http://your-server:4444/admin
  Direct IP:    http://192.168.1.100:4444

Credentials (SAVE THESE!):
  Admin Login:     admin / admin123
  DB Username:     futurusus
  DB Password:     <auto-generated>
  DB Root Pass:    <auto-generated>

Server Commands:
  cd /var/www/futurus
  ./status.sh   - Check status
  ./logs.sh     - View logs
  ./restart.sh  - Restart containers
  ./backup.sh   - Backup database
  ./debug.sh    - Debug information
  ./stop.sh     - Stop containers

SSH Access (Amazon):
  ssh -i "/path/to/key.pem" ubuntu@192.168.1.100

NOTE: Database passwords were auto-generated.
They are also saved in /var/www/futurus/.env
```

---

## Troubleshooting

### SSH Connection Failed
- Verify server IP and port
- Check SSH credentials
- Ensure firewall allows SSH (port 22)

### Docker Build Failed
- Ensure Docker Desktop is running
- Check available disk space
- Verify Dockerfile.prod exists

### Containers Not Healthy
- Run `./debug.sh` on server
- Check `./logs.sh` for errors
- Verify database credentials

### HTTP 500 Error
- Check Laravel logs: `./logs.sh app`
- Verify `.env` configuration
- Run `docker exec futurus-app-prod php /var/www/html/core/artisan config:clear`

### Database Connection Failed
- Wait for database container to be healthy
- Verify credentials in `.env`
- Check `./logs.sh db` for errors
