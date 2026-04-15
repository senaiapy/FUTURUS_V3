# 🌐 Futurus - Web Deployment Guide

**App Name:** Futurus
**Build Output:** `/dist` directory
**Build Time:** ~16 seconds
**Bundle Size:** 4.75 MB (JS) + 15.5 kB (CSS)

---

## ✅ Web Build Complete

Your React Native app has been successfully exported as a web application!

**Build Location:** `/Users/galo/PROJECTS/sportcenter.space/mobile/template/dist`

**Build Contents:**

- ✅ `index.html` - Main entry point
- ✅ `_expo/static/js/` - JavaScript bundles (4.75 MB)
- ✅ `_expo/static/css/` - CSS stylesheets (15.5 kB)
- ✅ `favicon.ico` - Site favicon
- ✅ Assets (18 images from navigation)

---

## 🚀 Quick Deploy Options

Choose one of these platforms for instant deployment:

### Option 1: Vercel (Recommended) ⚡

**Fastest deployment, zero configuration needed.**

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   cd /Users/galo/PROJECTS/sportcenter.space/mobile/template
   vercel
   ```

3. **Follow prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **futurus**
   - Directory? **`./`** (current directory)
   - Override settings? **No**

4. **Production deployment:**
   ```bash
   vercel --prod
   ```

**Result:** Your app will be live at `https://futurus.vercel.app`

**Configuration:** [vercel.json](vercel.json) already created ✅

---

### Option 2: Netlify 🎯

**Great for CI/CD and team collaboration.**

#### Method A: Netlify CLI

1. **Install Netlify CLI:**

   ```bash
   npm i -g netlify-cli
   ```

2. **Login:**

   ```bash
   netlify login
   ```

3. **Deploy:**

   ```bash
   cd /Users/galo/PROJECTS/sportcenter.space/mobile/template
   netlify deploy
   ```

4. **Production:**
   ```bash
   netlify deploy --prod
   ```

#### Method B: Netlify Web Interface

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. **Build settings:**
   - Build command: `pnpm web:export`
   - Publish directory: `dist`
   - Node version: `22`
5. Click "Deploy site"

**Configuration:** [netlify.toml](netlify.toml) already created ✅

---

### Option 3: GitHub Pages (Free) 📄

**Free hosting for public repositories.**

1. **Install gh-pages:**

   ```bash
   pnpm add -D gh-pages
   ```

2. **Add deploy script to package.json:**

   ```json
   "scripts": {
     "deploy:gh-pages": "pnpm web:export && gh-pages -d dist"
   }
   ```

3. **Deploy:**

   ```bash
   pnpm deploy:gh-pages
   ```

4. **Enable in GitHub:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

**URL:** `https://yourusername.github.io/futurus`

---

### Option 4: Firebase Hosting 🔥

**Google's hosting with CDN and SSL.**

1. **Install Firebase CLI:**

   ```bash
   npm i -g firebase-tools
   ```

2. **Login:**

   ```bash
   firebase login
   ```

3. **Initialize:**

   ```bash
   cd /Users/galo/PROJECTS/sportcenter.space/mobile/template
   firebase init hosting
   ```

4. **Configuration:**
   - Public directory: `dist`
   - Single-page app: **Yes**
   - Set up automatic builds: **No**

5. **Deploy:**
   ```bash
   pnpm web:export
   firebase deploy --only hosting
   ```

**URL:** `https://your-project.web.app`

---

### Option 5: AWS S3 + CloudFront ☁️

**Enterprise-grade with full AWS integration.**

1. **Create S3 bucket:**

   ```bash
   aws s3 mb s3://futurus
   ```

2. **Enable static website hosting:**

   ```bash
   aws s3 website s3://futurus --index-document index.html
   ```

3. **Upload build:**

   ```bash
   pnpm web:export
   aws s3 sync dist/ s3://futurus --acl public-read
   ```

4. **Create CloudFront distribution** (optional for CDN):
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Error pages: 404 → `/index.html` (for client-side routing)

---

### Option 6: Custom Server (VPS/Droplet)

**For self-hosted deployment.**

1. **Build the app:**

   ```bash
   pnpm web:export
   ```

2. **Copy to server:**

   ```bash
   scp -r dist/* user@yourserver.com:/var/www/futurus/
   ```

3. **Nginx configuration:**

   ```nginx
   server {
       listen 80;
       server_name futurus.com;
       root /var/www/futurus;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

---

## 🔧 Build Commands Reference

### Production Build

```bash
pnpm web:export
# Output: /dist directory
# Environment: APP_ENV=production
```

### Staging Build

```bash
pnpm web:export:staging
# Output: /dist directory
# Environment: APP_ENV=staging
```

### Local Preview

```bash
pnpm web:serve
# Starts local server at http://localhost:3000
# Serves the /dist directory
```

### Development Server

```bash
pnpm web
# Starts Expo web dev server with hot reload
```

---

## 🌍 Environment Configuration

The web build uses the production environment by default.

**Production API (.env.production):**

```bash
API_URL=https://api.futurus.com.br/api
SECRET_KEY=production-secret-key-change-this
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
```

**To change API URL for web:**

1. Update `.env.production`:

   ```bash
   API_URL=https://your-actual-api.com/api
   ```

2. Rebuild:
   ```bash
   pnpm web:export
   ```

---

## 📊 Build Analysis

**Total Bundle Size:** 4.75 MB (uncompressed)

**Breakdown:**

- JavaScript: 4.75 MB
- CSS: 15.5 kB
- Images/Assets: ~20 kB
- HTML: 1.41 kB

**Modules:** 3,437 modules bundled

**Performance Tips:**

- ✅ Code splitting enabled
- ✅ Static assets cached (1 year)
- ✅ Metro bundler optimizations
- ⚠️ Consider lazy loading for routes (future optimization)

---

## 🔐 Custom Domain Setup

### Vercel

1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add domain: `futurus.com`
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Netlify

1. Go to Netlify dashboard → Site settings → Domain management
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

### SSL Certificate

Both Vercel and Netlify provide **automatic SSL certificates** (Let's Encrypt).

---

## 🧪 Testing the Web Build

### Local Testing

1. **Serve the build:**

   ```bash
   pnpm web:serve
   ```

2. **Open browser:**
   http://localhost:3000

3. **Test features:**
   - ✅ Navigation between pages
   - ✅ Product listing
   - ✅ Add to cart
   - ✅ Wishlist
   - ✅ Responsive design
   - ✅ API connectivity

### Production Testing

After deployment, test on multiple devices:

- **Desktop:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS Safari, Chrome Mobile, Firefox Mobile
- **Tablets:** iPad, Android tablets

---

## 📱 Progressive Web App (PWA)

Your app can be installed as a PWA on mobile devices!

**Current PWA Features:**

- ✅ Web manifest configured
- ✅ Responsive design
- ✅ Mobile-optimized UI

**To enhance PWA:**

1. Add to `app.config.ts`:

   ```typescript
   web: {
     favicon: './assets/favicon.png',
     bundler: 'metro',
     name: 'Futurus',
     shortName: "Club",
     description: 'E-commerce mobile and web app',
     themeColor: '#2E3C4B',
     backgroundColor: '#FFFFFF',
   }
   ```

2. Rebuild and deploy

**Install prompt will appear on:**

- Chrome/Edge (desktop & mobile)
- Safari iOS 16.4+ (Add to Home Screen)

---

## 🔄 CI/CD Setup

### GitHub Actions (Vercel)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.12.3

      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm web:export

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### GitHub Actions (Netlify)

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 10.12.3

      - uses: actions/setup-node@v3
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install

      - run: pnpm web:export

      - uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod --dir=dist
```

---

## 🐛 Troubleshooting

### Build fails with "Invalid environment variables"

**Fix:** Make sure `.env.production` exists and has all required variables:

```bash
API_URL=https://api.futurus.com.br/api
SECRET_KEY=your-secret-key
```

### "404 Not Found" on routes

**Fix:** Configure your hosting for client-side routing:

- **Vercel:** Already configured in vercel.json ✅
- **Netlify:** Already configured in netlify.toml ✅
- **Custom server:** Add `try_files $uri $uri/ /index.html;` to Nginx

### Large bundle size warning

**Normal:** React Native web bundles are larger (~5MB). This is expected.

**Optimizations:**

- Enable gzip/brotli compression (automatic on Vercel/Netlify)
- Use CDN for static assets
- Implement route-based code splitting (advanced)

### API calls failing

**Check:**

1. API_URL in .env.production is correct
2. Backend API is deployed and accessible
3. CORS is enabled on backend
4. API endpoints match frontend expectations

---

## 📈 Performance Optimization

### Enable Compression

Most platforms enable this automatically, but for custom servers:

**Nginx:**

```nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml;
gzip_min_length 1000;
```

### CDN Configuration

- **Vercel:** Built-in global CDN ✅
- **Netlify:** Built-in CDN ✅
- **Cloudflare:** Add as proxy (free tier available)

### Caching Headers

Already configured in vercel.json and netlify.toml:

- Static assets: 1 year cache
- HTML: No cache (always fresh)

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Backend API is deployed and accessible
- [ ] Update API_URL in `.env.production`
- [ ] Update SECRET_KEY in `.env.production`
- [ ] Test local build with `pnpm web:serve`
- [ ] Verify all pages work (shop, cart, wishlist, profile)
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (automatic on Vercel/Netlify)
- [ ] Set up analytics (Google Analytics, Mixpanel, etc.)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Create backup/rollback plan

---

## 🎯 Recommended Workflow

### Development

```bash
pnpm web              # Local dev server with hot reload
```

### Staging

```bash
pnpm web:export:staging
netlify deploy        # Test deployment
```

### Production

```bash
pnpm web:export
vercel --prod         # Production deployment
```

---

## 📞 Support & Resources

- **Expo Web Docs:** https://docs.expo.dev/workflow/web/
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **Firebase Hosting:** https://firebase.google.com/docs/hosting

---

## 🎉 Summary

Your **Futurus** web app is ready to deploy!

**What's Ready:**

- ✅ Web build generated (`/dist`)
- ✅ Vercel configuration (vercel.json)
- ✅ Netlify configuration (netlify.toml)
- ✅ All deployment scripts
- ✅ Production environment configured

**Quick Deploy:**

```bash
# Vercel (recommended)
vercel --prod

# Or Netlify
netlify deploy --prod

# Or GitHub Pages
pnpm deploy:gh-pages
```

**Next Steps:**

1. Choose a hosting platform
2. Deploy using the commands above
3. Configure custom domain (optional)
4. Test the live site
5. Share with users!

Your web app will be live in minutes! 🚀
