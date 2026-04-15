# 🌐 Quick Web Deployment - Futurus

**Status:** ✅ Ready to Deploy
**Build Location:** `/dist` (4.75 MB)
**Build Time:** 16 seconds

---

## 🚀 Deploy in 2 Steps

### Option 1: Vercel (Fastest) ⚡

```bash
cd /Users/galo/PROJECTS/sportcenter.space/mobile/template

# Login to Vercel (one-time)
vercel login

# Deploy to production
vercel --prod
```

**Result:** Live at `https://futurus-xxx.vercel.app` in 30 seconds

---

### Option 2: Netlify

```bash
# Login to Netlify (one-time)
netlify login

# Deploy to production
netlify deploy --prod
```

---

### Option 3: Use the Deployment Script

```bash
# Run interactive deployment script
./deploy-web.sh
```

The script will guide you through:

1. Choosing platform (Vercel/Netlify/Firebase/GitHub Pages)
2. Automatic login if needed
3. One-click deployment

---

## 📁 What's Been Built

```
/dist/
├── index.html                    # Main entry
├── favicon.ico                   # Site icon
├── metadata.json                 # App metadata
└── _expo/static/
    ├── js/web/
    │   └── entry-*.js           # 4.75 MB bundle
    └── css/
        └── web-*.css            # 15.5 kB styles
```

**Total Size:** 4.75 MB (uncompressed)
**Modules:** 3,437 bundled
**Assets:** 18 images

---

## ⚙️ Environment

Currently using **production** environment:

**API URL:** `https://api.futurus.com.br/api`

**To change:**

1. Edit `.env.production`
2. Run `pnpm web:export`
3. Deploy again

---

## 🎯 Quick Commands

```bash
# Rebuild
pnpm web:export

# Preview locally
pnpm web:serve
# Opens http://localhost:3000

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod

# Use deployment script
./deploy-web.sh
```

---

## 🔧 Configuration Files

All configuration is ready:

- ✅ [vercel.json](vercel.json) - Vercel configuration
- ✅ [netlify.toml](netlify.toml) - Netlify configuration
- ✅ [deploy-web.sh](deploy-web.sh) - Deployment script
- ✅ [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md) - Full guide (detailed)

---

## 🌍 Custom Domain

### Vercel

1. Go to project settings → Domains
2. Add: `futurus.com`
3. Update DNS CNAME to `cname.vercel-dns.com`

### Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS CNAME to `your-site.netlify.app`

**SSL Certificate:** Automatic ✅

---

## ✅ Pre-Deploy Checklist

Before deploying, verify:

- [x] Web build generated (`/dist` exists)
- [x] Environment configured (`.env.production`)
- [ ] Backend API is deployed and accessible
- [ ] API_URL points to live backend
- [ ] Test local build: `pnpm web:serve`

---

## 📱 Features

Your web app includes:

- ✅ Product listing and search
- ✅ Shopping cart
- ✅ Wishlist
- ✅ User profile
- ✅ Responsive design (mobile + desktop)
- ✅ Client-side routing
- ✅ PWA-ready

---

## 🐛 Troubleshooting

**"The specified token is not valid"**
→ Run `vercel login` first

**"404 Not Found" on routes**
→ Already fixed in vercel.json and netlify.toml ✅

**API calls failing**
→ Update API_URL in `.env.production` and rebuild

**Build fails**
→ Check that all dependencies are installed: `pnpm install`

---

## 📞 Need Help?

See [WEB_DEPLOYMENT.md](WEB_DEPLOYMENT.md) for:

- Detailed deployment guides
- All hosting options
- CI/CD setup
- Performance optimization
- Custom server configuration

---

## 🎉 Ready to Deploy!

Your Futurus web app is built and ready.

**Choose your preferred method above and deploy in minutes!**

**Recommended:** Vercel for fastest deployment with zero configuration.

```bash
vercel login
vercel --prod
```

That's it! Your app will be live. 🚀
