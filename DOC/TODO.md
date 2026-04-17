and as the same with admin stack and routes pages 

###

after install with setup-futurus.sh with docker compose receive this message: Services:
  Frontend:  http://localhost:3300
  Backend:   http://localhost:3302
  Admin:     http://localhost:3301
  Database:  localhost:15432

Mode: development

Asaas Configuration:
  PIX Gateway:    Code 127 (configured)
  Card Gateway:   Code 128 (configured)
  PIX Withdraw:   Method ID 1 (configured)
  Bank Transfer:  Method ID 2 (configured)

Webhook URL:
  Configure in Asaas Dashboard: http://your-domain/api/asaas/ipn

⚠️  Remember to configure your Asaas API keys in the Admin Panel:
   Admin > Gateways > Configure > Enter API Key

verify if its all ok in server-upload.sh script and fix if not

###

read .nev var in frontend and backend and admin and change the APP name displayed in the frontend and admin pages and login pages and verify if its all ok in server-upload.sh script and fix if not, and update logo image basead in .env var NEXT_PUBLIC_APP_NAME="Futurus" use logoFuturus.png image, and logoPredigo.png and logoPrevejo.png if its "Prevejo"  images in home landpage in path /run/media/gamba/FDDD-FEE1/FUTURUS_V3/Futurus-NEXTJS/frontend/src/app/[locale]/page.tsx and all pictures placed in /images/logo/ , change this in building to select correct logo and name of APP, and update all the images in the frontend and admin pages and login pages and verify if its all ok in server-upload.sh script and fix if not.
