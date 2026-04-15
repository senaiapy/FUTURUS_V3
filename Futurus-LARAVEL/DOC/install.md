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

/Users/galo/PROJECTS/futurus.pem
/Users/galo/PROJECTS/futuruscombr.pem
