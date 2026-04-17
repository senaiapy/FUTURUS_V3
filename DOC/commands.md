cd /Users/galo/PROJECTS/futurus.com.br/F-NEXTJS && docker-compose build frontend admin 2>&1 | tail -20 

sshpass -p "@45" ssh -o StrictHostKeyChecking=no root@89.163.146.144 'cd /www/wwwroot/futurus.us && cat > .env << "EOF"
# Database Credentials
DB_DATABASE=futurusus
DB_USERNAME=futurusus
DB_PASSWORD=Ra4YKew3ZrET82dR
DB_ROOT_PASSWORD=rootPassword123!

# phpMyAdmin Configuration
PMA_PORT=4481
EOF
' && echo ".env configured!"

sshpass -p "@45" ssh -o StrictHostKeyChecking=no root@89.163.146.144 'cd /www/wwwroot/futurus.us && docker compose down 2>/dev/null; docker compose up -d 2>&1'


sshpass -p '@450Ab6606289828server' ssh -o StrictHostKeyChecking=no root@89.163.146.144 "cd /www/wwwroot/futurus.us && echo 'Stopping existing containers...' && docker compose down 2>/dev/null || true && echo 'Starting containers...' && docker compose up -d && echo 'Containers started!'"

sshpass -p '@450Ab6606289828server' ssh -o StrictHostKeyChecking=no root@89.163.146.144 "echo 'Pulling AMD64 MariaDB image...' && docker pull --platform linux/amd64 mariadb:10.6 && echo 'Done!'"

cd /Users/galo/PROJECTS/FUTURUS_V2/Futurus-NEXTJS && echo -e "n\n\n\n\n\ndev\nn\nn" | bash setup-futurus.sh 2>&1 

cd /Users/galo/PROJECTS/FUTURUS_V2/Futurus-NEXTJS && docker compose build admin --no-cache && docker compose up -d admin

docker logs futurus-backend 2>&1 | tail -50 

docker restart futurus-backend && sleep 3 && docker logs futurus-backend 2>&1 | tail -10 

printf "n\n3000\n3001\n3002\n5432\ndev\nn\nn\n" | bash setup-futurus.sh 

./setup-futurus.sh <<EOF
n
3000
3001
3002
5432
dev
n
n
EOF

docker-compose down -v --rmi all && docker system prune -f --volumes && docker image prune -a -f 

echo -e "n\n\n\n\n\ndev\ny\nn" | bash setup-futurus.sh 

docker exec -t futurus-backend npx tsx prisma/seed.ts 

echo -e "n\n\n\n\n\ndev\nn\nn" | bash setup-futurus.sh 


docker-compose stop admin backend frontend && docker-compose rm -f admin backend frontend && docker-compose build --no-cache admin backend frontend && docker-compose up -d admin backend frontend 

docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend 

## clear nginx cache
rm -rf /www/server/nginx/proxy_cache_dir/* 2>/dev/null; rm -rf /var/cache/nginx/* 2>/dev/null; echo "Cache cleared" 

docker-compose -f docker-compose.production.yml up -d --build frontend

docker compose build frontend && docker compose up -d frontend

## running setup-futurus.sh
printf 'n\n\n\n\n\ndev\nn\nn\n' | bash setup-futurus.sh 

sshpass -p '@450Ab6606server' ssh -o StrictHostKeyChecking=no gamba@51.83.103.50 "echo '@' | sudo -S docker exec Prevejo-backend sh -c 'echo \$CORS_ORIGINS' 2>&1"

sshpass -p '@450Ab6606server' ssh -o StrictHostKeyChecking=no gamba@51.83.103.50 "echo '@' | sudo -S docker exec Prevejo-backend sh -c 'curl -s http://localhost:3001/api/markets | head -100' 2>&1"