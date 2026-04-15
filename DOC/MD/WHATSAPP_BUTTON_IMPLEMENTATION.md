# WhatsApp Fixed Button Implementation

## 📱 Overview

A fixed, pulsing WhatsApp button has been implemented across all three platforms:
- ✅ **FUTURUS Mobile** (React Native/Expo)
- ✅ **FUTURUS Frontend** (Next.js)
- ✅ **LARAVEL** (Laravel/Blade)

## 🎯 Features

- **Fixed Position**: Bottom-right corner, doesn't scroll with page
- **Pulsing Animation**: Eye-catching animated pulse effect
- **Pre-filled Message**: Opens WhatsApp with "Oi" message
- **Responsive**: Adapts to mobile and desktop screens
- **Phone Number**: Configurable via environment variables (default: 5511995009969)

---

## 📂 Implementation Details

### 1. FUTURUS Mobile (React Native)

**Component Location**: `FUTURUS/mobile/src/components/whatsapp-button.tsx`

**How it works**:
- Uses `moti` for smooth pulse animation
- Opens WhatsApp via deep linking (`Linking.openURL`)
- Phone number from `NEXT_PUBLIC_ZAP_PHONE` environment variable
- Pre-fills message with "Oi"

**Environment Configuration**:
```env
# .env.development or .env.production
NEXT_PUBLIC_ZAP_PHONE=5511995009969
```

**Already Integrated**:
- The button is already active in the mobile app
- Located in `mobile/src/app/_layout.tsx` at line 95
- Renders at the bottom-right of all screens

**Code**:
```tsx
<WhatsAppButton />
```

---

### 2. FUTURUS Frontend (Next.js)

**Component Location**: `FUTURUS/frontend/src/components/WhatsAppButton.tsx`

**How it works**:
- Uses Tailwind CSS for styling
- CSS animation for pulse effect (`animate-ping`)
- Opens WhatsApp in new tab
- Phone number from `NEXT_PUBLIC_WHATSAPP_PHONE` environment variable

**Environment Configuration**:
```env
# .env or .env.local
NEXT_PUBLIC_WHATSAPP_PHONE=5511995009969
```

**Integration**:
- Already added to root layout: `frontend/src/app/[locale]/layout.tsx`
- Renders on all pages automatically
- Positioned bottom-right, fixed

**Code**:
```tsx
import { WhatsAppButton } from "@/components/WhatsAppButton";

// In your layout
<WhatsAppButton />
```

---

### 3. LARAVEL (PHP/Blade)

**Component Location**: `LARAVEL/core/resources/views/components/whatsapp-button.blade.php`

**How it works**:
- Pure CSS animation (no JavaScript required)
- Opens WhatsApp in new tab
- Phone number from `WHATSAPP_PHONE` environment variable
- Styled with inline CSS for easy customization

**Environment Configuration**:
```env
# .env
WHATSAPP_PHONE=5511995009969
```

**Integration**:
- Already added to master layout: `core/resources/views/templates/basic/layouts/master.blade.php`
- Renders on all pages that extend the master layout

**Code**:
```blade
{{-- In your Blade template --}}
<x-whatsapp-button />
```

---

## 🎨 Customization

### Change Phone Number

**Mobile**:
```env
NEXT_PUBLIC_ZAP_PHONE=5511999999999
```

**Frontend**:
```env
NEXT_PUBLIC_WHATSAPP_PHONE=5511999999999
```

**LARAVEL**:
```env
WHATSAPP_PHONE=5511999999999
```

### Change Message

**Mobile** (`whatsapp-button.tsx`):
```tsx
const message = 'Olá! Gostaria de mais informações.';
```

**Frontend** (`WhatsAppButton.tsx`):
```tsx
const message = 'Olá! Gostaria de mais informações.';
```

**LARAVEL** (`whatsapp-button.blade.php`):
```php
$message = 'Olá! Gostaria de mais informações.';
```

### Customize Position

**Mobile** (edit `styles.container` in `whatsapp-button.tsx`):
```tsx
container: {
  bottom: 100,  // Change distance from bottom
  right: 20,    // Change distance from right
}
```

**Frontend** (edit className in `WhatsAppButton.tsx`):
```tsx
<div className="fixed bottom-6 right-6 z-50">
  {/* Change bottom-6 and right-6 values */}
</div>
```

**LARAVEL** (edit CSS in `whatsapp-button.blade.php`):
```css
.whatsapp-button-container {
  bottom: 24px;  /* Change distance from bottom */
  right: 24px;   /* Change distance from right */
}
```

### Change Colors

Default WhatsApp green: `#25D366`
Hover state: `#20BA5A`

All components use these colors. To change, search for `#25D366` in each component file.

---

## 🧪 Testing

### Mobile
1. Run the app: `npm start` or `expo start`
2. Look for green pulsing button at bottom-right
3. Tap it to open WhatsApp with "Oi" message

### Frontend
1. Start development server: `npm run dev`
2. Visit any page
3. Click the green pulsing button at bottom-right
4. Should open WhatsApp in new tab

### LARAVEL
1. Visit any page on the site
2. Look for green pulsing button at bottom-right
3. Click it to open WhatsApp in new tab

---

## 📱 WhatsApp URL Format

All implementations use the same URL format:
```
https://wa.me/5511995009969?text=Oi
```

- Works on both mobile and desktop
- Opens WhatsApp Web on desktop
- Opens WhatsApp app on mobile
- Pre-fills the message "Oi"

---

## ✅ Implementation Checklist

- [x] Mobile component created and integrated
- [x] Frontend component created and integrated
- [x] LARAVEL component created and integrated
- [x] Environment variables configured
- [x] Pulsing animation implemented
- [x] Pre-filled message "Oi" configured
- [x] Responsive design for all screen sizes
- [x] Fixed positioning (doesn't scroll)

---

## 🔧 Troubleshooting

### Button not showing?

**Mobile**: Check if `<WhatsAppButton />` is in `_layout.tsx`

**Frontend**:
1. Check if imported in layout: `import { WhatsAppButton } from "@/components/WhatsAppButton";`
2. Check if added to JSX: `<WhatsAppButton />`
3. Restart dev server

**LARAVEL**:
1. Check if component exists: `core/resources/views/components/whatsapp-button.blade.php`
2. Check if added to layout: `<x-whatsapp-button />`
3. Clear views cache: `php artisan view:clear`

### Phone number not working?

1. Verify environment variable is set correctly
2. Restart development server
3. Check phone number format (country code + number, no spaces or special characters)

### Animation not smooth?

The pulse animation uses:
- Mobile: Moti library (hardware accelerated)
- Frontend: Tailwind's `animate-ping` (CSS animation)
- LARAVEL: Pure CSS `@keyframes` animation

All should be smooth. If not, check browser/device performance.

---

## 📞 Contact Information

**Current WhatsApp Number**: 5511995009969

To change this number globally:
1. Update environment variables in all three platforms
2. Restart development servers
3. For production, update .env.production files and redeploy

---

## 🚀 Next Steps

To enable social login functionality mentioned in the setup:
1. Get Google OAuth credentials
2. Get Facebook OAuth credentials
3. Uncomment strategies in `backend/src/auth/auth.module.ts`
4. Add credentials to `backend/.env`

---

**Created**: March 13, 2026
**Platforms**: FUTURUS Mobile, FUTURUS Frontend, LARAVEL
**Status**: ✅ Fully Implemented and Active
