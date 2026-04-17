cd /Users/galo/PROJECTS/FUTURUS_V2/Futurus-LARAVEL && docker compose restart 

curl -s -X POST http://192.168.15.14:4444/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@site.com","password":"admin123"}' | python3 -m json.tool 2>/dev/null || echo "JSON parse failed, raw response:" && curl -s -X POST http://192.168.15.14:4444/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@site.com","password":"admin123"}' 

  docker-compose down && docker-compose build --no-cache && docker-compose up -d 

  docker exec futurus-app-dev bash -c "cd core && php artisan optimize:clear"
## test connection
  sshpass -p '' ssh -o StrictHostKeyChecking=no gamba@54.233.128.31 "echo 'CONNECTION OK' && echo '' | sudo -S docker ps --format '{{.Names}}' 2>/dev/null && echo '---' && echo '' | sudo -S docker compose ls 2>/dev/null"

## restore database
sshpass -p '@' ssh -o StrictHostKeyChecking=no gamba@51.83.103.50 "echo '@' | sudo -S docker ps --format '{{.Names}} {{.Status}}' 2>/dev/null && echo '---' && echo '@' | sudo -S find / -name 'docker-compose.yml' -path '*/futurus*' 2>/dev/null | head -5"

## restore database
sshpass -p '@' scp -o StrictHostKeyChecking=no /Users/galo/PROJECTS/FUTURUS_V3/Futurus-LARAVEL/backups/db_20260417_195834.sql.gz gamba@51.83.103.50:/tmp/db_restore.sql.gz
sshpass -p '@' ssh -o StrictHostKeyChecking=no gamba@51.83.103.50 "
cd /www/wwwroot/futurus.net.br
source .env 2>/dev/null
echo 'DB_DATABASE: '\$DB_DATABASE
echo 'DB_ROOT_PASSWORD: '\$DB_ROOT_PASSWORD
echo 'Restoring backup...'
gunzip -c /tmp/db_restore.sql.gz | echo '@' | sudo -S docker exec -i futurus-db-prod mysql -uroot -p\"\$DB_ROOT_PASSWORD\" \"\$DB_DATABASE\" 2>&1
echo 'Exit code: '\$?
"

## clear laravel caches and restart 
sshpass -p '@' ssh -o StrictHostKeyChecking=no gamba@51.83.103.50 "
echo '@' | sudo -S -v 2>/dev/null
cd /www/wwwroot/futurus.net.br
source .env 2>/dev/null

echo '=== Updating Laravel .env ==='
sudo docker exec futurus-app-prod sed -i 's/^DB_HOST=.*/DB_HOST=db/' /var/www/html/core/.env
sudo docker exec futurus-app-prod sed -i 's/^DB_DATABASE=.*/DB_DATABASE='\$DB_DATABASE'/' /var/www/html/core/.env
sudo docker exec futurus-app-prod sed -i 's/^DB_USERNAME=.*/DB_USERNAME='\$DB_USERNAME'/' /var/www/html/core/.env
sudo docker exec futurus-app-prod sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD='\$DB_PASSWORD'/' /var/www/html/core/.env

echo '=== Running migrations ==='
sudo docker exec futurus-app-prod php /var/www/html/core/artisan migrate --force 2>&1

echo '=== Clearing caches ==='
sudo docker exec futurus-app-prod php /var/www/html/core/artisan config:clear 2>&1
sudo docker exec futurus-app-prod php /var/www/html/core/artisan cache:clear 2>&1
sudo docker exec futurus-app-prod php /var/www/html/core/artisan view:clear 2>&1

echo '=== Restarting app ==='
sudo docker restart futurus-app-prod
sleep 5

echo '=== Health check ==='
curl -s -o /dev/null -w 'HTTP Status: %{http_code}\n' http://localhost:4444
"