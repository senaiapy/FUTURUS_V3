# 🔧 Environment Variables Configuration

## ✅ No More Hardcoded URLs!

All URLs are now configured via environment variables for easy deployment across different environments.

---

## 📋 Environment Variables

### Required Variables

| Variable         | Description            | Development Example           | Production Example           |
| ---------------- | ---------------------- | ----------------------------- | ---------------------------- |
| `API_URL`        | Backend API endpoint   | `http://192.168.0.7:6062/api` | `https://api.futurus.com.br/api` |
| `SIMPLE_API_URL` | Frontend static assets | `http://192.168.0.7:6060`     | `https://futurus.com.br`         |
| `SECRET_KEY`     | App secret key         | `development-secret-key`      | (stored in EAS Secrets)      |

### Optional Variables

| Variable                 | Description               | Default                      |
| ------------------------ | ------------------------- | ---------------------------- |
| `ENABLE_ANALYTICS`       | Enable analytics tracking | `false` (dev), `true` (prod) |
| `ENABLE_CRASH_REPORTING` | Enable crash reporting    | `false` (dev), `true` (prod) |

---

## 📁 Environment Files

### Development: `.env.development`

```bash
# Backend API URL
API_URL=http://192.168.0.7:6062/api

# Frontend URL (for static assets like images)
SIMPLE_API_URL=http://192.168.0.7:6060

SECRET_KEY=development-secret-key
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
```

### Production: `.env.production`

```bash
# Backend API URL
API_URL=https://api.futurus.com.br/api

# Frontend URL (for static assets like images)
SIMPLE_API_URL=https://futurus.com.br

SECRET_KEY=production-secret-key-change-this
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
```

---

## 🔄 Alternative Configurations

### For USB-Connected Device (ADB Reverse)

```bash
# 1. Setup ADB port forwarding
adb reverse tcp:6062 tcp:6062
adb reverse tcp:6060 tcp:6060

# 2. Update .env.development
API_URL=http://localhost:6062/api
SIMPLE_API_URL=http://localhost:6060
```

### For iOS Simulator

```bash
API_URL=http://localhost:6062/api
SIMPLE_API_URL=http://localhost:6060
```

### For Android Emulator

```bash
API_URL=http://10.0.2.2:6062/api
SIMPLE_API_URL=http://10.0.2.2:6060
```

### For Physical Device (WiFi)

```bash
# Replace with your computer's IP address
API_URL=http://192.168.0.7:6062/api
SIMPLE_API_URL=http://192.168.0.7:6060
```

---

## 🚀 Usage in Code

### Accessing Environment Variables

```typescript
import { Env } from '@env';

// Backend API calls
const response = await fetch(`${Env.API_URL}/products`);

// Static assets (images)
const imageUrl = `${Env.SIMPLE_API_URL}/images/${filename}`;

// App configuration
const analyticsEnabled = Env.ENABLE_ANALYTICS;
```

### Example: Product Card Component

```typescript
import { Env } from '@env';

const imageUrl = product.images?.[0]?.url
  ? `${Env.SIMPLE_API_URL}/images/${product.images[0].url}`
  : 'https://via.placeholder.com/300x300/e5e5e5/999999?text=No+Image';
```

---

## 🔄 Switching Environments

### Development Mode (Default)

```bash
pnpm start
# or
pnpm android
pnpm ios
```

Uses `.env.development`

### Staging Mode

```bash
APP_ENV=staging pnpm start
# or
pnpm start:staging
pnpm android:staging
pnpm ios:staging
```

Uses `.env.staging` (create this file if needed)

### Production Mode

```bash
APP_ENV=production pnpm start
# or
pnpm start:production
pnpm android:production
pnpm ios:production
```

Uses `.env.production`

---

## 🏗️ EAS Build Configuration

### Store Secrets in EAS

For production builds, store sensitive values in EAS Secrets instead of committing them:

```bash
# Add secret
eas secret:create --name SECRET_KEY --value "your-production-secret"

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name SECRET_KEY
```

### Reference in eas.json

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://api.futurus.com.br/api",
        "SIMPLE_API_URL": "https://futurus.com.br",
        "ENABLE_ANALYTICS": "true"
      }
    }
  }
}
```

---

## 📝 Environment Validation

The app uses **Zod** to validate environment variables at build time.

**File**: `env.js`

```javascript
const client = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  API_URL: z.string(),
  SIMPLE_API_URL: z.string(),
  // ... other variables
});
```

### If validation fails:

```bash
❌ Invalid environment variables:
Missing variables in .env.development file
Make sure all required variables are defined
```

**Solution**: Add missing variables to your `.env.*` file

---

## 🧪 Testing Different Configurations

### Test with local backend and frontend

```bash
API_URL=http://localhost:6062/api
SIMPLE_API_URL=http://localhost:6060
```

### Test with production API, local images

```bash
API_URL=https://api.futurus.com.br/api
SIMPLE_API_URL=http://localhost:6060
```

### Test with all production

```bash
API_URL=https://api.futurus.com.br/api
SIMPLE_API_URL=https://futurus.com.br
```

---

## 🔒 Security Best Practices

1. ✅ **Never commit secrets** to Git
   - Use `.gitignore` for `.env.*` files
   - Store production secrets in EAS Secrets

2. ✅ **Use different keys per environment**
   - Development: Simple keys for debugging
   - Production: Strong, random keys

3. ✅ **Validate all variables**
   - Zod schema catches missing/invalid values
   - Fail fast at build time

4. ✅ **Document required variables**
   - Keep this file updated
   - Add examples for each environment

---

## 📊 Current Configuration

### Development

- **API**: `http://192.168.0.7:6062/api` (Backend on WiFi)
- **Images**: `http://192.168.0.7:6060/images/` (Frontend static)
- **Device**: Physical Android via WiFi

### Production

- **API**: `https://api.futurus.com.br/api`
- **Images**: `https://futurus.com.br/images/`
- **CDN**: (optional) Configure Cloudinary/S3 for images

---

## 🐛 Troubleshooting

### Issue: "Environment variable not defined"

**Solution**: Restart Metro bundler with cache clear

```bash
pnpm start -c
```

### Issue: Changes to .env not reflected

**Solution**: Metro caches environment variables

```bash
# Kill Metro
pkill -f "expo start"

# Clear cache and restart
pnpm start -c
```

### Issue: TypeScript error "Cannot find module '@env'"

**Solution**: Restart TypeScript server

```bash
# In VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
# Or restart your IDE
```

---

## ✅ Summary

All hardcoded URLs have been replaced with environment variables:

- ✅ `API_URL` - Backend API endpoint
- ✅ `SIMPLE_API_URL` - Static assets (images)
- ✅ Easy switching between environments
- ✅ Validated at build time with Zod
- ✅ Secure production deployment with EAS Secrets

**No more hardcoded IPs!** 🎉
