# Prevejo Server Upload Script Documentation

## Overview

`server_upload.sh` is an interactive deployment script for building, packaging, uploading, and deploying the Prevejo Next.js application to a remote server.

**Location:** `PREVEJO/prevejo-v2/server_upload.sh`

---

## Stack Information

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 |
| Runtime | Node.js 20 Alpine |
| Default Port | 4447 |
| Container | prevejo-app |

---

## Features

| Feature | Description |
|---------|-------------|
| Port Configuration | Configure application port |
| Clean Docker Images | Remove old Prevejo images locally |
| Clean Docker Volumes | Remove old volumes |
| Multi-Architecture Build | Build for AMD64 or ARM64 (Apple Silicon) |
| Image Compression | Export and compress images for transfer |
| SSH Password Auth | Standard password authentication |
| SSH Key Auth | Amazon EC2 / .pem key file support |
| Remote Installation | Install Docker and deploy on server |
| Debug & Verification | Remote health checks and debugging |

---

## Interactive Steps

### Step 1: Port Configuration
```
Port for application [4447]:
```
- Default port: `4447`
- Maps to internal container port `3000`

### Step 2: Clean Old Docker Images
```
Do you want to erase all old Prevejo Docker images locally? (y/N)
```
- Removes `prevejo-app:latest`
- Removes all images matching `prevejo*`

### Step 3: Clean Old Docker Volumes
```
Do you want to erase all old Prevejo Docker volumes locally? (y/N)
```
- Stops all containers
- Removes all Prevejo volumes

### Step 4: Build and Compile
```
Do you want to build and compile the Docker image? (Y/n)
```

#### Step 4.1: Architecture Selection
```
Select target architecture:
  1) Linux AMD64 (Standard servers, AWS, DigitalOcean, etc.)
  2) MacBook M1/M2/M3 (ARM64)
Choose architecture [1]:
```
- AMD64: For standard x86_64 servers
- ARM64: For Apple Silicon Macs

### Step 5: Export and Compress Images
```
Do you want to export and compress Docker image for transfer? (Y/n)
```
- Exports `prevejo-app:latest` to `prevejo-app.tar.gz`

### Step 6: Server Configuration
```
Server IP or hostname:
SSH Username [root]:
Remote installation path [/var/www/prevejo]:
SSH Port [22]:
```

### Step 7: SSH Authentication
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

### Step 8: Test SSH Connection
- Verifies connection to server before proceeding

### Step 9: Create Server Files
Generates the following files:
- `docker-compose.yml` - Container orchestration
- `.env` - Environment variables
- `start.sh` - Start container
- `stop.sh` - Stop container
- `restart.sh` - Restart container
- `logs.sh` - View container logs
- `status.sh` - Check container status
- `rebuild.sh` - Rebuild from new image
- `debug.sh` - Debug information

### Step 10: Upload to Server
```
Ready to upload files to 192.168.1.100. Continue? (Y/n)
```
Uploads:
- Docker image (compressed)
- Configuration files
- Management scripts

### Step 11: Remote Installation
- Installs Docker on server (if not present)
- Loads Docker image from compressed file
- Sets file permissions
- Starts container

### Step 12: Verification and Debug
- Runs `debug.sh` on remote server
- Performs HTTP health check
- Displays container status

### Step 13: Cleanup
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
Starts the container.

### stop.sh
```bash
./stop.sh
```
Stops the container.

### restart.sh
```bash
./restart.sh
```
Restarts the container.

### logs.sh
```bash
./logs.sh
```
View container logs.

### status.sh
```bash
./status.sh
```
Shows container status, HTTP health check, and disk usage.

### rebuild.sh
```bash
./rebuild.sh
```
Stops container, removes old image, loads new image, and starts container.
Useful for updating deployments.

### debug.sh
```bash
./debug.sh
```
Shows comprehensive debug information:
- Container status
- App container logs (last 50 lines)
- HTTP health check with response time
- Container resource usage
- Docker images list

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
- Port open: APP_PORT (default 4447)

---

## Usage

```bash
cd PREVEJO/prevejo-v2
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
  Application:  http://your-server:4447
  Direct IP:    http://192.168.1.100:4447

Server Commands:
  cd /var/www/prevejo
  ./status.sh   - Check status
  ./logs.sh     - View logs
  ./restart.sh  - Restart container
  ./rebuild.sh  - Rebuild from new image
  ./debug.sh    - Debug information
  ./stop.sh     - Stop container

SSH Access (Amazon):
  ssh -i "/path/to/key.pem" ubuntu@192.168.1.100

Deployment finished!
```

---

## Docker Compose Configuration

The generated `docker-compose.yml`:

```yaml
services:
  prevejo:
    image: prevejo-app:latest
    container_name: prevejo-app
    restart: always
    ports:
      - "4447:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

---

## Updating Deployments

To update an existing deployment with a new image:

1. Build new image locally:
   ```bash
   ./server_upload.sh
   # Choose to build but skip cleanup
   ```

2. Or on the server, if you uploaded a new image:
   ```bash
   cd /var/www/prevejo
   ./rebuild.sh
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
- Verify Dockerfile exists
- Check `next.config.ts` has `output: 'standalone'`

### Container Not Starting
- Run `./debug.sh` on server
- Check `./logs.sh` for errors
- Verify port is not in use

### HTTP 502/503 Error
- Container may still be starting
- Check `./logs.sh` for startup errors
- Verify the build completed successfully

### Out of Memory
- Next.js standalone builds are optimized
- If still failing, increase server RAM
- Check for memory leaks in logs

---

## Comparison with Futurus Script

| Feature | Futurus | Prevejo |
|---------|---------|---------|
| Database | MariaDB | None |
| Database Backup | Yes | N/A |
| Database Restore | Yes | N/A |
| Volume Export | Yes | N/A |
| Framework | Laravel | Next.js |
| Default Port | 4444 | 4447 |
| Build Time | 10-15 min | 3-5 min |
| Container Name | futurus-app-prod | prevejo-app |
