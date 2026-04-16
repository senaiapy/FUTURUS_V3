deep analyze all source code of a prediction market in laravel, in a
  @LARAVEL folder, and implemente this same frontend, in a expo mobile app,
  in a folder @FUTURUS/mobile, using all libs existed and only migrate the
  laravel frontend to works fine in this mobile expo react native code,
  using the same libs, typescript, tailwind, and another, with
  authentication, login, register, user dashboard, routes, language
  translate, and using the laravel backend api, to connect over mobile over 
  tanstack react query, or implement new API in a laravel backend to         
  connect with this mobile app, using the same pages routes, auth, design,   
  layout, texts, assets, and translator, and deploy this to fix any erros    
  or issue 

  analyze all LARAVEL API gateways and create or update to running with a mobile APP in a @LARAVEL/MOBILE folder, and testing app for any issue, init implement a AUTH, with login,register and forget, after testing mobile and continue

  rebuild all mobile app to testing  and fix any error or issue and verify if in Laravel API gatewais command used with laravel frontend, and implement this for a mobile too in Laravel Backend and implement this in a mobile app if not exist or update this, if exist, to connect with a laravel backenc, for example: markets, transactions, dasboards, withdraw, wallets, purchase, ticket, etc, and testing all routes in laravel api and mobile api

in @FUTURUS/admin in side menu Mrkets all submenu routes dont work, in Deposits, submenu pending approved and gateways dont work too, in withdraw menu and withdraw metod and pending dont works too, analyze @LARAVEL admin to complete this routes, based in original admin panel or visualize pictures in @FUTURUS/admin/futurus-admin-images folder to complete all routes an testing this

  create one setup-futurus-dev.sh in a docker compose folder to init all stacks, firts ask me if want a backup of database in a backend/bachups folder, second ask me to ports to deploy backend, frontend, admin,if not inserted place default ports for this: frontend 3000, backend 3301, admin 3302, and save this to execute in next step, thirt ask me if deploy in development mode, or production mode, and use .env.development or .env.rpoduction for this specified in Dockefile, after this ask to erase all data in volumes, next build all without cache, migrate prisma db, seed database and finish ask me if want restore database backuped, and show all ports initialized for backend, frontend, admin, database; and use as example for this setup-production.sh and backup-docker.sh, and restore-docker.sh, in the same folder of docker compose.

copy all assets of @LARAVEL/assets to @FUTURUS/frontend/public, and implement the same design of landing page with all functionalities of all images placed in @FUTURUS/forntend/futurus-landing-images folder, with a beutiful design and layout and in first card one animations.

now my app is connected fo @FUTURUS backend , but not display any image of markets in mobile APP, implement .env API= next or laravel, if API=laravel  use the actual laravel gateway to download images, but if API=next update the API gateway to downloads images of markets. only for @FUTURUS/mobile app

now running @LARAVEL docker compose to init this stack, verifyand fix any issues, and running @FUTURUSmobile over adb in a phisical device to testing all alaravel API, with .env mobile API=laravel

in @futurus mobile app, in home page change the link in GAMIFY card "Comecar a Ganhar" , to the same link of Drawer "Game"

implement in @LARAVEL stack the gateway Asaas to pay wit BRL PIX in route /admin/gateway/automatic an create your config page, and fixit in initial config with active gateway and when user implement a velue to deposit, genearate a pix qrcode and waite for webhook to confirm payment and insert this credits in user cash value if webhook with success

create the same whatsapp button, positioned in footer of pages and fixed in this, flashing, and not scrooling, and when press acess a web whatsapp or mobile whatsapp, over phone number placed in .env=5511995009969, and send a 'Oi' to this number when clicked to initi a conversation, and toghethers created in a frontend of @LARAVEL in laravel and @FUTURUS in nextjs, as a example a whatsapp button in @FUTURUS/mobile component

my root ssh access to complete all for me is ssh root@217.79. password @,and my stack running over aapanel in /www/wwwroot/futurus.com.br and like as git pull

analyze all skills and agents for design in @design/ folder, principally futurus.fig in figma design, and implement a new beautiful design, based in this figma with all this beautiful layouts and color scheme, to a mobile device in @FUTURUS/mobile, but dont change any function or routes, or text, only change themes and colors and design and layout based in this futurus.fig  

create a permissions rules for access to admin panel, for all users, named UserPermissions, and referenced to all users, except admin user, and initially with access locked, and only read active. This permissions include access to all routes admin pages and restrict or permit access to this admin pages with this permisisons for pages "access" or "lock" user entry or not access, "Read" or "read/Write" read to only view, and write to view and edit and this UserPermissions only active and visible and editable for ADMIN user. and have a middleware activated when access ADMIN panel to enable or disable VIEWS and EDITS, implement this rules only in F-NEXTJS stak , admin folder, and in backend to save all in database, and over API.and the first route page to access is a ADMIN login page, to access, or lock and notshow nothing, only message user is not admin sty in admin group.

in frontend footer, below this links: Link de Política
Política de Privacidade
Termos de Serviço
Política de Segurança add a new link named "Account Remove" or en portuguese Remover Conta do Usuario, and this link redirect a one page as the same of contact page but with text, send us a mail to remove your account information of our databases, and transltate to portuguese.and include in this page otptimized for mobile devices, and include in this a form with all data to be completed and a send button to send email to us, as the same function in contact route.when press the button in contact page, display message "Mensagem Enviada" but in account remove redirect to other app, as the seme function to send a contact mail.

in a TAB "Identidad Visual" include in a form one link to upload a App Logo, and display this logo beside the name of website, in frontend and admin panel, and store this  icon in a @F-NEXTJS/backend/uploads/images, with all api and system upload images, to display in frontend and admin. 

in @F-NEXTJS admin panel side menu setting add a new TAB named "Profile" and change all data of contact address placed in a frontend dinamically, over api as:Informação de Contato
Email
contato@futurus-brasil.com
Telefone
+55 11 99500-1234
Endereço
Av. Paulista 3500 CJ.124. 
placed in frontend footer or other page

and create in Admin Page a side menu BLOG, to publish all content in a frontend Blog in a Card with a images downloads and all texts too, with all API to change this and create a first Blog content with a Theme of Start of Futurus Prediction Markets, with texts an a beautiful picture, and deploy all in docer and verify if API backend Frontend, and Admin is works fine to create news Blogs.all optimized to mobile webbrowser and translated to portuguese.

in @Futurus-LARAVEL/  stack docker compose i want to change port to expose this stack of 8080 to 4444 analize all docker files and docker compose and scripts to restore.sh, backup.sh, setup-prod.sh, setup proxy.sh to execute all this operations, and create in .bin in this folder a file with only necessary images of docker, docker-compose , containers, images, and volumes to deploy with this direct in server, without any security fails. all compiled for production. after finish, place all files necessaries to deploy in a .bin folder

create a script to execute all this compile and generete all and insert all images, volumes or others in a remote server, and ask me to insert a ip of server, user, path, and password to connect an upload allscript named deploy_to_server.sh in @Futurus-LARAVEL folder.

change this script deploy_to_server.sh to running as the same setup-futurus.sh and ask me a if i want a database backup, ports of stacks using to generate, erase all old images, erase  old  volumes, build and compile, ask me to generate image for mackbook m1 or linux amd64, compress this images and volumes generates, ask me restore backup database, compress images and volumes to upload a remote server, ask me a server ip, user ssh, password, path to unzip, if is amazon server, ask me if ssh amazon key path, and upload, and remote install and debug all in remote server to confirm all ok.  

i want to execute a pentest in https://futurus.net.br and criate a complete relatory of all security fails and what reslve this 

## COMPONENTS UI 

"I want you to create a src/components/ui folder for us to implement the visual components that are generic across various pages, such as the button, and use the component I am selecting to create the base for the button component. Use Tailwind, tailwind-merge, and tailwind-variants when necessary to create multiple variants of the same component. Don't forget to extend the native button properties in TypeScript and use named exports—never use default exports."
and use biome configurated with tailwind and typescript, and use this configuration to format all code, and fix any linting errors, and use this configuration to format all code, and fix any linting errors, Fix these errors that Biome is pointing out: The class text-[var(--color-text-primary)] can be written as text-(--color-text-primary) (suggestCanonicalClasses).
Do not use twMerge when using variants, because you can pass className directly as a variant property, along with variant and size, and tailwind-variants performs the merge automatically.
Document these component creation standards in an agents.md file inside the ui folder so that future components follow the same patterns.
Create a component example page that will list all of our UI components with all their variants so we can visually see how they turned out. and place this page in @app.


  i want to create a script to : ask me a build in production a new docker image in temp folder, ask me erase all old images, and ask me erase all old volumes, ask me to create a linux images or mac arm images, ask me all ports to use in build or defult ports to backend, admin, frontend, postgres, pgadmin, and buld and compile all images over the same of setup-club.sh but i production mode, after build ok, askme the ip of remote server, ask me of connect over ssh or ssh_keyid, askme over port ssh or default 22, askme password or folder path to key, ask me a user to connect, ask me path to install default is /www/wwwroot/yourdomain, test connection, if not ok return to remote server questions, if all ok verify if necessary use sudo su, to all functions, with the same password or  only with sudo      , and verify if have old docker mages running, sstop all, and ask me to erase all odl images, and ask em erase all old volumes, compress all new images gerated, and volumes and upload, with storage and database bakcups, and scripts to start, stop, backup and restore dcker images, start all in remote server and verify if all healthy, and finnaly ask me to erase remote source files and folders, if not used, and ask me to erase temp folder used to generate all images for execute and create a new super_upload_script.sh use as base server_upload.sh,and when finish super_upload_script.sh ask me if want recover database backup and end all.when in this script ask me to remove old database in remote server, if yes, ask me if want backup this database image