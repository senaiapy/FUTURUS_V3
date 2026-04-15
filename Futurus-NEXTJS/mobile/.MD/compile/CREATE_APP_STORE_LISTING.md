# Create App Store Connect Listing - REQUIRED FIRST STEP

## ⚠️ Important: You Must Create the App in App Store Connect First!

The submission failed because the app `com.futurus` doesn't exist in App Store Connect yet. You **must** create the app listing **before** submitting the binary.

---

## Error Received

```
No suitable application records were found.
Verify your bundle identifier "com.futurus" is correct
and that you are signed in with an Apple ID that has access to
the app in App Store Connect.
```

**This means**: The app hasn't been created in App Store Connect yet.

---

## Step-by-Step: Create App in App Store Connect

### 1. Login to App Store Connect

Go to: https://appstoreconnect.apple.com

Login with your Apple Developer account credentials.

---

### 2. Create New App

1. Click **"My Apps"** in the top navigation
2. Click the **"+"** button (top left)
3. Select **"New App"**

---

### 3. Fill in Required Information

#### Platform

- ✅ Check **iOS**

#### Name

```
Futurus
```

#### Primary Language

```
Spanish (ES)
```

#### Bundle ID

**IMPORTANT**: Select from dropdown:

```
com.futurus
```

**Note**: If `com.futurus` doesn't appear in the dropdown:

1. Go to https://developer.apple.com/account/resources/identifiers/list
2. Create a new App ID with Bundle ID: `com.futurus`
3. Come back and refresh App Store Connect
4. The bundle ID should now appear in the dropdown

#### SKU

```
com.futurus.app
```

**Note**: SKU is a unique identifier for your records. Use any unique string.

#### User Access

```
Full Access
```

---

### 4. Click "Create"

App Store Connect will create the app record.

---

## After Creating the App

### Option A: Submit via EAS (Recommended)

Once the app is created in App Store Connect, retry submission:

```bash
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
eas submit --platform ios
```

**When prompted:**

- Select the latest build: `66c9651b-b30a-4955-acfb-751e87503124`
- Enter Apple ID credentials
- The submission should succeed this time

---

### Option B: Manual Upload via Transporter

If EAS submit still fails, use Transporter manually:

1. **Download the .ipa file**
   - Go to: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/66c9651b-b30a-4955-acfb-751e87503124
   - Click **"Download"** button
   - Save the `.ipa` file

2. **Install Transporter** (if not already installed)
   - Go to Mac App Store
   - Search for "Transporter"
   - Install the app

3. **Upload with Transporter**
   - Open Transporter app
   - Sign in with your Apple ID
   - Drag and drop the `.ipa` file
   - Click **"Deliver"**
   - Wait for upload to complete (2-5 minutes)

---

## Complete the App Store Listing

After the binary is uploaded, complete the app metadata:

### 1. App Information

Go to: **App Store Connect** → **My Apps** → **Futurus** → **App Information**

Fill in:

- **Privacy Policy URL**: https://futurus.com.br/privacy
- **Category**: Shopping
- **Content Rights**: Check if applicable

---

### 2. Pricing and Availability

Go to: **Pricing and Availability**

Set:

- **Price**: Free
- **Availability**: All territories (or select specific countries)

---

### 3. Prepare for Submission

Go to: **App Store** → **iOS App** → **Version 1.0.8**

#### Required Fields:

**Screenshots** (Required for all sizes):

- 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 px
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688 px
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 px

**Description** (Spanish):

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

📱 EXPERIENCIA MÓVIL OPTIMIZADA:
• Navegación fluida y rápida
• Diseño moderno e intuitivo
• Lista de deseos para guardar favoritos
• Historial completo de pedidos

¡Descargá ahora y empezá a ahorrar en tus compras!
```

**Keywords** (100 chars max):

```
ofertas,Brazil,compras,descuentos,tienda,productos,shopping,guaraníes
```

**Promotional Text** (Optional, 170 chars max):

```
🎉 Nueva app móvil de Futurus! Accedé a miles de productos con los mejores precios de Brazil. ¡Descargá gratis!
```

**Support URL**:

```
https://futurus.com.br/support
```

**Marketing URL** (Optional):

```
https://futurus.com.br
```

**What's New in This Version**:

```
Primera versión de Futurus.

• Navegación rápida y optimizada
• Más de 11,000 productos disponibles
• Pago seguro con múltiples opciones
• Seguimiento de pedidos en tiempo real

¡Gracias por descargar Futurus!
```

---

### 4. Build Selection

1. Scroll to **"Build"** section
2. Click **"+"** or **"Select a build before you submit your app"**
3. Wait for build to process (10-60 minutes after upload)
4. Select the uploaded build (version 1.0.8, build 1)

---

### 5. App Review Information

**Contact Information**:

- First Name: [Your Name]
- Last Name: [Your Last Name]
- Phone: [Your Phone]
- Email: [Your Email]

**Demo Account** (if login required):

```
Username: demo@futurus.com.br
Password: Demo123456!
```

**Notes for Reviewer**:

```
Bienvenido a Futurus!

CREDENCIALES DE PRUEBA:
Email: demo@futurus.com.br
Contraseña: Demo123456!

FLUJO DE PRUEBA:
1. Iniciar sesión con las credenciales proporcionadas
2. Explorar el catálogo de productos
3. Agregar productos al carrito
4. Ver el checkout (no se procesarán pagos reales)
5. Ver historial de pedidos

NOTAS:
- Los precios están en guaraníes (₲) - moneda de Brazil
- La app se conecta al servidor de producción
- No se procesarán transacciones reales durante la revisión

Gracias por revisar nuestra aplicación.
```

---

### 6. Age Rating

Click **"Edit"** and answer the questionnaire:

- Most answers will be **"No"**
- Result should be: **4+**

---

### 7. Submit for Review

1. Review all information
2. Click **"Save"** (top right)
3. Click **"Add for Review"**
4. Click **"Submit to App Review"**

---

## Timeline

After submission:

| Phase              | Duration                 |
| ------------------ | ------------------------ |
| Upload Binary      | ✅ Complete              |
| Processing         | 10-60 minutes            |
| Waiting for Review | Immediate                |
| In Review          | 1-3 days                 |
| Ready for Sale     | Immediate after approval |

---

## Troubleshooting

### Issue: Build not appearing in Build section

**Wait**: Builds take 10-60 minutes to process after upload
**Check**: Go to **Activity** tab to see processing status

---

### Issue: "Missing Compliance" warning

**Solution**:

1. Go to **App Store Connect** → **My Apps** → **Futurus**
2. Click **"Manage"** next to the build
3. Answer export compliance questions
4. Select **"No"** (already configured in app.config.ts)

---

### Issue: Screenshots rejected

**Solution**: Ensure screenshots are actual app screenshots, not marketing materials

- Use real iPhone devices or simulator
- Show actual app functionality
- No text overlays or marketing graphics

---

## Quick Command Reference

```bash
# Submit after creating app in App Store Connect
cd /Users/galo/PROJECTS/futurus.com.br-version1.0.8/mobile
eas submit --platform ios

# Or download build manually
# Visit: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/66c9651b-b30a-4955-acfb-751e87503124
# Click "Download"
# Upload with Transporter app
```

---

## Important URLs

- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer Portal**: https://developer.apple.com/account/
- **Build Dashboard**: https://expo.dev/accounts/futuruspy/projects/pyfoundation/builds/66c9651b-b30a-4955-acfb-751e87503124
- **Transporter App**: https://apps.apple.com/app/transporter/id1450874784

---

## Summary

✅ **Build Completed Successfully**
❌ **Submission Failed** - App not created in App Store Connect
📝 **Next Step**: Create app in App Store Connect (follow steps above)
🔄 **Then**: Retry submission with `eas submit --platform ios`

---

**Date**: December 3, 2024
**Build ID**: 66c9651b-b30a-4955-acfb-751e87503124
**Bundle ID**: com.futurus
**Status**: Binary ready, waiting for App Store Connect setup
