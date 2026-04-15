cd /Users/galo/PROJECTS/FUTURUS_V2/Futurus-LARAVEL && docker compose restart 

curl -s -X POST http://192.168.15.14:4444/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@site.com","password":"admin123"}' | python3 -m json.tool 2>/dev/null || echo "JSON parse failed, raw response:" && curl -s -X POST http://192.168.15.14:4444/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@site.com","password":"admin123"}' 

  docker-compose down && docker-compose build --no-cache && docker-compose up -d 

  docker exec futurus-app-dev bash -c "cd core && php artisan optimize:clear"