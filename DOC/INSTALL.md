adb reverse tcp:8080 tcp:8080 && adb reverse tcp:8081 tcp:8081 && adb reverse tcp:8083 tcp:8083 && echo "Ports forwarded"

adb reverse tcp:8080 tcp:8080 && adb reverse tcp:8082 tcp:8082 && adb reverse --list && echo "✅ ADB reverse ports set"


docker-compose build --no-cache frontend && docker-compose up -d frontend

docker exec -t futurus-backend npx prisma db seed 2>&1

docker exec -t futurus-backend npx prisma db seed

docker exec -t futurus-backend npx prisma db seed && docker exec -t futurus-backend npx ts-node prisma/seed_
admin.ts

# FUTURUS next
# 1. Redirect the Backend API
adb reverse tcp:3001 tcp:3001

# 2. Redirect the Mobile Bundler (Metro)
adb reverse tcp:8082 tcp:8082

# LARAVEL
# 1. Redirect the Backend API
adb reverse tcp:8080 tcp:8080

# 2. Redirect the Mobile Bundler (Metro)
adb reverse tcp:8082 tcp:8082


# ASAAS API KEY FUTURUS
$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmVjMTVkNmUzLWQzMTctNDU5OS1hYTc5LTg3OGQ3NzA4YWEzNjo6JGFhY2hfNzlmMDc0ZTUtMTU5MS00Mjk3LWE3NDgtYTc2NGJhMTY0ZjI4 

# ASAAS API KEY FUTURUS 2

$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmZlYzBhMWQ5LWNhYTctNDM0ZS04ZjhkLTI0NGVmNmEzMmY4Zjo6JGFhY2hfMmNiNDVmYWMtZTQxZi00NjE3LWIxYzgtMmY5MWRmYTc5ODQx

# WALLET ID

4f4097e3-4626-452d-8905-2e36eab25d06 

## ASAAS API KEY FUTURUS_SAND 

$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjM1OWZiODdiLTU5MGQtNDYxOC05Y2MxLTY5MmRjZDM5NjBlODo6JGFhY2hfNDdlNWE1M2UtM2NhNy00YWY1LWE3MDctY2NhZTk1Yzc1MWE1 

# webhook ASAAS
https://futurus-brasil.com/ipn/asaas


openssl rand -base64 64

docker exec futurus-backend npx prisma studio --port 5555 2>&1 &
sleep 2 && echo "Prisma Studio should be accessible at http://localhost:5555"

docker exec futurus-backend npx prisma db seed 2>&1

sleep 8 && curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' 2>&1


curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' 2>&1

  curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' 2>&1

  sleep 8 && curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"password123"}' 2>&1 | python3 -m json.tool 2>&1 | head -5

  √

adb reverse tcp:8080 tcp:8080
adb reverse tcp:8082 tcp:8082


docker exec futurus-app-dev bash -c "cd /var/www/html/core && php artisan view:clear && php artisan cache:clear" 

ssh -i /Users/galo/PROJECTS/futurus.pem ubuntu@54.207.93.117 "sudo mkdir -p /home/ubuntu/upload && sudo chown -R ubuntu:ubuntu /home/ubuntu/upload"

/Users/galo/PROJECTS/futurus.pem



to use amazon laravel proxy to port http:127.0.0.1:4447 
and in /www/server/panel/vhost/nginx/proxy/www.futurus.net.br/b362c7f56971c5e4c
  a5ee076462a259f_www.futurus.net.br.conf

  change proxy_pass http://127.0.0.1:4447; 

  and add this config
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Host $host; 

  # Reload Nginx for proxy changes:
  /www/server/nginx/sbin/nginx -s reload

  # Restart Docker container for Laravel changes:
  docker restart <container_name>

  # Clear Laravel caches:
  docker exec <container_name> php core/artisan cache:clear
  docker exec <container_name> php core/artisan config:clear 

# TO FIX ADMIN USER AND PASSWORD
  docker exec futurus-app-prod php core/artisan tinker --execute="
  \$admin = \App\Models\Admin::where('username', 'admin')->first();
  if(\$admin) {
      \$admin->password = \Hash::make('admin123');
      \$admin->save();
      echo 'Admin password updated successfully';
  } else {
      echo 'Admin user not found - creating new one';
      \$admin = new \App\Models\Admin();
      \$admin->name = 'Super Admin';
      \$admin->username = 'admin';
      \$admin->email = 'admin@example.com';
      \$admin->password = \Hash::make('admin123');
      \$admin->save();
  }"

# FIX MARIADB PASSWORD BACKUP
sudo docker exec futurus-db-prod env | grep MARIADB

# Get current password from .env
cat .env | grep DB_ROOT_PASSWORD

# Then connect and reset (use the password from .env)
sudo docker exec -it futurus-db-prod mysql -uroot -p
# Once inside MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YOUR_NEW_PASSWORD_FROM_ENV';
FLUSH PRIVILEGES;


cat .env | grep DB_ROOT_PASSWORD
sudo docker exec futurus-db-prod env | grep MARIADB_ROOT_PASSWORD

sudo timedatectl set-timezone America/Sao_Paulo 

# AGENTS kit antigravity
npx @vudovn/ag-kit init