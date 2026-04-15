# iOS Build & Apple App Store Publishing Guide

Complete step-by-step guide to compile and publish the Futurus mobile app to the Apple App Store.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Build Configuration](#build-configuration)
- [Build Process](#build-process)
- [Submit to App Store](#submit-to-app-store)
- [App Store Connect Setup](#app-store-connect-setup)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Tools

1. **Apple Developer Account** ($99/year)
   - Enroll at: https://developer.apple.com/programs/
   - Status must be: Active and Paid

2. **Mac Computer** (required for iOS development)
   - macOS 12.0 or later
   - Xcode 14+ installed from Mac App Store

3. **EAS CLI** (Expo Application Services)

   ```bash
   npm install -g eas-cli
   ```

4. **Expo Account**
   - Sign up at: https://expo.dev
   - Project already configured with ID: `762f480f-9c15-44b5-99a6-e228c430a71c`
   - Owner: `futuruspy`

### Verify Installations

```bash
# Check Xcode version
xcodebuild -version

# Check EAS CLI
eas --version

# Check if logged in to EAS
eas whoami
```

If not logged in:

```bash
eas login
```

---

## Environment Setup

### 1. Install Dependencies

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
pnpm install
```

### 2. Set UTF-8 Encoding (Required for CocoaPods)

Add to `~/.zshrc` or `~/.bash_profile`:

```bash
export LANG=en_US.UTF-8
```

Then reload:

```bash
source ~/.zshrc
```

### 3. Verify Production Environment Variables

Check that `eas.json` contains production environment variables:

```json
{
  "build": {
    "production": {
      "env": {
        "APP_ENV": "production",
        "API_URL": "https://api.futurus.com.br/api",
        "SIMPLE_API_URL": "https://api.futurus.com.br",
        "IMAGE_BASE_URL": "https://api.futurus.com.br/images",
        "SECRET_KEY": "production-secret-key-2024"
      }
    }
  }
}
```

---

## Build Configuration

### Current Configuration

**App Information:**

- **App Name**: Futurus
- **Bundle ID**: `com.futurus`
- **Version**: `1.0.8` (from package.json)
- **Build Number**: `1`
- **Apple Team**: 5MSQX2BRA2 (marcelo anjos)

**Files Already Configured:**

- ✅ `app.json` - iOS bundle ID and build number
- ✅ `app.config.ts` - EAS Updates and runtime version
- ✅ `eas.json` - Build profiles and environment variables
- ✅ `package.json` - Dependencies including expo-updates
- ✅ `.easignore` - Optimized build uploads

---

## Build Process

### Option 1: Cloud Build (Recommended)

Build on EAS servers - no local Mac required for compilation.

#### Step 1: Start the Build

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

Or using npm script:

```bash
npm run build:production:ios
```

#### Step 2: Configure Credentials (First Time Only)

When prompted:

1. **Choose credential method**:
   - Select: `Let EAS handle credentials automatically` (recommended)

2. **Apple ID Login**:
   - Enter your Apple Developer account email
   - Enter password
   - Complete 2FA authentication

3. **EAS Auto-generates**:
   - Distribution Certificate
   - Provisioning Profile
   - Push Notification keys (if needed)

#### Step 3: Wait for Build

- **Upload time**: ~1-2 minutes (565 MB)
- **Build time**: ~10-20 minutes
- **Monitor**: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds

You'll receive:

- Build completion notification via email
- `.ipa` file download link
- Build artifacts (dSYM for crash reporting)

---

### Option 2: Local Build

Build on your Mac (requires Xcode and more time).

#### Step 1: Generate iOS Project (if needed)

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean
```

#### Step 2: Install CocoaPods

```bash
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

#### Step 3: Build Locally

```bash
APP_ENV=production npx eas build --platform ios --local
```

This builds on your machine but still uses EAS for credentials and submission.

---

## Submit to App Store

### Method 1: EAS Submit (Recommended - Automated)

After the build completes successfully:

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
eas submit --platform ios
```

Or using npm script:

```bash
npm run submit:ios
```

**EAS will:**

1. Prompt for Apple ID credentials
2. Select the latest build automatically
3. Upload to App Store Connect
4. Process with TestFlight

---

### Method 2: Manual Upload

#### Step 1: Download the .ipa File

From build page: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds

#### Step 2: Upload via Transporter

**Option A: Transporter App** (Recommended)

1. Install from Mac App Store: https://apps.apple.com/app/transporter/id1450874784
2. Open Transporter
3. Sign in with Apple ID
4. Drag and drop `.ipa` file
5. Click "Deliver"

**Option B: Xcode**

1. Open Xcode
2. Go to `Window` > `Organizer`
3. Click `Archives` tab
4. Drag `.ipa` to Archives
5. Click `Distribute App`
6. Select `App Store Connect`
7. Follow wizard

---

## App Store Connect Setup

### 1. Create App Listing

Go to: https://appstoreconnect.apple.com

1. Click **"My Apps"**
2. Click **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Futurus
   - **Primary Language**: Spanish (ES)
   - **Bundle ID**: com.futurus
   - **SKU**: com.futurus.app
   - **User Access**: Full Access

---

### 2. App Information

#### Required Fields:

**Name**: Futurus

**Subtitle**: Ofertas y descuentos en Brazil

**Category**:

- Primary: Shopping
- Secondary: (Optional)

**Age Rating**: 4+

**Privacy Policy URL**: https://futurus.com.br/privacy

**Support URL**: https://futurus.com.br/support

**Marketing URL** (Optional): https://futurus.com.br

---

### 3. Pricing and Availability

- **Price**: Free
- **Availability**: All countries
- **App Distribution**: App Store

---

### 4. Version Information

#### Description (4000 characters max):

```
🛍️ DESCUBRE LAS MEJORES OFERTAS EN Brazil

Futurus es tu destino de compras en línea para encontrar productos de calidad a los mejores precios.

✨ CARACTERÍSTICAS DESTACADAS:
• Más de 11,000 productos disponibles
• 579 marcas reconocidas
• 18 categorías: tecnología, hogar, moda y más
• Ofertas diarias y descuentos exclusivos
• Búsqueda inteligente con filtros avanzados
• Precios en guaraníes actualizados en tiempo real

💳 COMPRA SEGURA:
• Carrito de compras protegido
• Múltiples métodos de pago
• Efectivo, tarjetas y Mercado Pago
• Proceso de checkout rápido y sencillo

🚚 ENVÍO A TODO Brazil:
• Seguimiento de pedidos en tiempo real
• Notificaciones de estado de entrega
• Entrega confiable y rápida
• Opciones de envío flexibles

📱 EXPERIENCIA MÓVIL OPTIMIZADA:
• Navegación fluida y rápida
• Diseño moderno e intuitivo
• Lista de deseos para guardar favoritos
• Historial completo de pedidos
• Notificaciones de ofertas especiales
• Sincronización entre dispositivos

🔒 SEGURIDAD Y CONFIANZA:
• Pagos seguros y encriptados
• Protección de datos personales
• Atención al cliente dedicada
• Garantía en todos los productos

🎯 ¿POR QUÉ ELEGIR Futurus?
Futurus es la plataforma líder de e-commerce en Brazil, conectando a miles de compradores con las mejores ofertas del mercado. Encuentra desde electrónica y tecnología hasta artículos para el hogar, moda, belleza y mucho más.

📦 CATEGORÍAS DISPONIBLES:
• Tecnología y Electrónica
• Hogar y Muebles
• Moda y Accesorios
• Deportes y Fitness
• Belleza y Cuidado Personal
• Juguetes y Niños
• Alimentos y Bebidas
• Automotriz
• Y muchas más...

¡Descargá ahora y empezá a ahorrar en tus compras!

---
Para soporte: support@futurus.com.br
Sitio web: https://futurus.com.br
```

#### Keywords (100 characters max):

```
ofertas,Brazil,compras,descuentos,tienda,productos,shopping,guaraníes
```

#### What's New in This Version:

```
Primera versión de Futurus.

🎉 NUEVA APLICACIÓN MÓVIL
• Navegación rápida y optimizada
• Acceso a más de 11,000 productos
• Pago seguro y múltiples opciones
• Seguimiento de pedidos en tiempo real

¡Gracias por descargar Futurus!
```

---

### 5. App Screenshots

#### Required Screenshot Sizes:

You need screenshots for different iPhone display sizes:

**6.7" Display** (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max):

- Size: **1290 x 2796 pixels**
- Minimum: 3 screenshots
- Maximum: 10 screenshots

**6.5" Display** (iPhone 11 Pro Max, XS Max):

- Size: **1242 x 2688 pixels**
- Minimum: 3 screenshots
- Maximum: 10 screenshots

**5.5" Display** (iPhone 8 Plus, 7 Plus, 6s Plus):

- Size: **1242 x 2208 pixels**
- Minimum: 3 screenshots
- Maximum: 10 screenshots

#### Recommended Screenshots:

1. **Home Screen** - Featured products and categories
2. **Product Catalog** - Product grid with filters
3. **Product Detail** - Product info, images, price
4. **Shopping Cart** - Cart items and checkout button
5. **Checkout** - Payment and delivery options
6. **Order Tracking** - Order status and history

#### How to Capture Screenshots:

**Option 1: iOS Simulator**

```bash
# Run app on simulator
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
npm run ios

# Take screenshot in simulator: Cmd + S
```

**Option 2: Real Device**

- Use physical iPhone
- Screenshot: Press `Volume Up + Power Button`
- Transfer to Mac via AirDrop or cable

**Option 3: Design Tools**

- Use Figma/Sketch to create marketing screenshots
- Add device frames for better presentation

---

### 6. App Review Information

#### Contact Information:

- **First Name**: [Your Name]
- **Last Name**: [Your Last Name]
- **Phone Number**: [Your Phone]
- **Email**: [Your Email]

#### Demo Account (if login required):

- **Username**: demo@futurus.com.br
- **Password**: Demo123456!
- **Notes**: "Use this account to test the full app functionality"

#### Notes for Reviewer:

```
Bienvenido a Futurus!

Esta aplicación permite a los usuarios comprar productos en línea en Brazil.

CREDENCIALES DE PRUEBA:
Email: demo@futurus.com.br
Contraseña: Demo123456!

FLUJO DE PRUEBA RECOMENDADO:
1. Iniciar sesión con las credenciales proporcionadas
2. Explorar el catálogo de productos
3. Agregar productos al carrito
4. Proceder al checkout (NO se procesará ningún pago real)
5. Ver el historial de pedidos

NOTAS IMPORTANTES:
- Los precios están en guaraníes (₲) - moneda de Brazil
- La aplicación se conecta a nuestro servidor de producción
- El pago de prueba no procesará transacciones reales

Gracias por revisar nuestra aplicación.
```

---

### 7. Build Selection

After upload completes (via EAS submit or manual):

1. Go to **"App Store"** tab
2. Click your version (e.g., "1.0.8")
3. Scroll to **"Build"** section
4. Click **"+"** or **"Select a build before you submit your app"**
5. Select the uploaded build
6. Wait for processing (can take 10-60 minutes)

---

### 8. Export Compliance

**Does your app use encryption?**

- Select **"No"** (already configured in app.config.ts with `ITSAppUsesNonExemptEncryption: false`)

---

### 9. Submit for Review

1. Review all information
2. Click **"Add for Review"** (top right)
3. Review submission checklist
4. Click **"Submit to App Review"**

---

## Build Monitoring

### Check Build Status

**Web Dashboard:**

```
https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds
```

**Terminal:**

```bash
# Lists all builds
eas build:list --platform ios

# View specific build
eas build:view [BUILD_ID]
```

### Download Build Artifacts

```bash
# Download .ipa file
eas build:download --platform ios

# Download specific build
eas build:download --id [BUILD_ID]
```

---

## Version Updates

### For Future Releases

#### 1. Update Version Number

Edit `package.json`:

```json
{
  "version": "1.0.3"
}
```

#### 2. Update iOS Build Number

Option A: Auto-increment (recommended):

```bash
eas build:version:set --platform ios
```

Option B: Manual in `app.json`:

```json
{
  "ios": {
    "buildNumber": "2"
  }
}
```

#### 3. Rebuild

```bash
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios
```

#### 4. Submit Update

```bash
eas submit --platform ios
```

---

## Troubleshooting

### Common Issues

#### Issue: `pnpm install --frozen-lockfile` fails

**Solution**: Ensure `pnpm-workspace.yaml` is removed from mobile directory.

```bash
rm pnpm-workspace.yaml
```

---

#### Issue: Missing environment variables

**Error**: `Required` environment variable errors

**Solution**: Verify `eas.json` contains all required env vars:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://api.futurus.com.br/api",
        "SIMPLE_API_URL": "https://api.futurus.com.br",
        "IMAGE_BASE_URL": "https://api.futurus.com.br/images",
        "SECRET_KEY": "production-secret-key-2024"
      }
    }
  }
}
```

---

#### Issue: CocoaPods encoding error

**Error**: `Unicode Normalization not appropriate for ASCII-8BIT`

**Solution**: Set UTF-8 encoding:

```bash
export LANG=en_US.UTF-8
cd ios && pod install
```

---

#### Issue: Bundle identifier mismatch

**Solution**: Regenerate iOS project for production:

```bash
rm -rf ios
APP_ENV=production EXPO_NO_DOTENV=1 npx expo prebuild --platform ios --clean
cd ios && export LANG=en_US.UTF-8 && pod install && cd ..
```

---

#### Issue: Build fails with "No development team found"

**Solution**: Add Apple Team ID to `app.json`:

```json
{
  "ios": {
    "appleTeamId": "5MSQX2BRA2"
  }
}
```

Find your Team ID: https://developer.apple.com/account/#/membership/

---

#### Issue: Provisioning profile invalid

**Solution**: Use EAS credentials manager:

```bash
eas credentials
```

Select:

- Platform: iOS
- Restore from backup or create new

---

#### Issue: App Review Rejection - Incomplete metadata

**Solution**: Ensure all required fields are complete:

- [ ] App description (minimum 10 characters)
- [ ] Screenshots for all required sizes
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating
- [ ] Demo account credentials (if login required)

---

## Quick Command Reference

```bash
# Navigate to mobile directory
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile

# Install dependencies
pnpm install

# Check EAS login
eas whoami

# Build for iOS production
APP_ENV=production EXPO_NO_DOTENV=1 eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios

# List builds
eas build:list --platform ios

# Download latest build
eas build:download --platform ios

# Update version
eas build:version:set --platform ios

# View credentials
eas credentials

# Open Xcode workspace (if using local build)
xed -b ios
```

---

## Important URLs

- **EAS Builds**: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com
- **Transporter App**: https://apps.apple.com/app/transporter/id1450874784
- **EAS Documentation**: https://docs.expo.dev/build/introduction/

---

## Review Timeline

**Typical Timeline:**

1. **Build**: 10-20 minutes
2. **Upload**: 2-5 minutes
3. **Processing**: 10-60 minutes
4. **In Review**: 1-3 days
5. **Ready for Sale**: Immediate after approval

**Status Meanings:**

- **Waiting for Upload**: Build not uploaded yet
- **Waiting for Review**: In queue
- **In Review**: Apple is reviewing
- **Pending Developer Release**: Approved, waiting for you to release
- **Ready for Sale**: Live on App Store
- **Rejected**: Needs changes and resubmission

---

## Support

For build issues:

- **EAS Support**: https://expo.dev/support
- **Expo Forums**: https://forums.expo.dev

For App Store issues:

- **Apple Developer Support**: https://developer.apple.com/contact/
- **App Review**: https://developer.apple.com/app-store/review/

---

## Notes

- **First build** may take longer due to credential setup
- **Keep your Mac awake** during local builds
- **Test on real device** before submitting
- **Monitor email** for App Store review updates
- **Backup credentials** generated by EAS

---

**Last Updated**: December 3, 2024
**Version**: 1.0.8
**Bundle ID**: com.futurus
**Apple Team**: 5MSQX2BRA2
