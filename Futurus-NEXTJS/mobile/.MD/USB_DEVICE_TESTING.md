# Testing Futurus Mobile App on Physical Android Device (USB)

## ✅ Configuration Complete!

Your mobile app is now configured to work with your physical Android device connected via USB.

---

## 🚀 Quick Start

### 1. Connect Your Device (One-time setup per connection)

Run the setup script every time you connect your device:

```bash
cd /media/galo/3a6b0a4e-6cfc-45eb-af54-75b5939133755/PROJECTS/Futurus/CLUBOFERTAS-V1.0.8/mobile
./setup-android-usb.sh
```

**Or manually:**

```bash
adb reverse tcp:6062 tcp:6062
```

### 2. Start the App

```bash
pnpm start -c
```

Press `a` to install and run on your Android device.

---

## 📝 Test Registration

Use these test credentials:

- **Name**: Test User
- **Email**: test@futurus.com
- **Password**: test123456
- **Confirm Password**: test123456

### Expected Flow:

1. Open app on your device
2. Navigate to Register screen
3. Fill in the form
4. Press "Sign Up"
5. ✅ Success alert: "Account created successfully! Please sign in."
6. Redirected to Login screen
7. Login with same credentials

---

## 🔧 How It Works

### ADB Reverse Port Forwarding

When you run `adb reverse tcp:6062 tcp:6062`, it creates a tunnel that:

- Forwards requests from `localhost:6062` on your **Android device**
- To `localhost:6062` on your **computer** (where the backend is running)

This means your phone can access the backend API as if it were running locally on the device!

### Environment Configuration

**File**: `.env.development`

```bash
API_URL=http://localhost:6062/api
```

This works because of the ADB reverse tunnel.

---

## 🐛 Troubleshooting

### Issue: "Network request failed" or registration error

**Solution:**

```bash
# 1. Check device is connected
adb devices

# 2. Re-run port forwarding
adb reverse tcp:6062 tcp:6062

# 3. Verify backend is running
curl http://localhost:6062/api/products?page=1&limit=1

# 4. Restart app with cache clear
pnpm start -c
```

### Issue: Device not showing in `adb devices`

**Solution:**

1. Enable **Developer Options** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. Reconnect USB cable
4. **Check device screen** - approve the USB debugging authorization prompt

### Issue: Port forwarding fails

**Solution:**

```bash
# Kill ADB server and restart
adb kill-server
adb start-server
adb devices
adb reverse tcp:6062 tcp:6062
```

### Issue: App shows old API URL

**Solution:**

```bash
# Clear Metro bundler cache
pnpm start -c

# Or clear all caches
pnpm start --clear
```

---

## 🌐 Alternative: WiFi Connection (No USB)

If you prefer testing over WiFi instead of USB:

### 1. Update `.env.development`:

```bash
# Use your computer's IP address
API_URL=http://192.168.0.7:6062/api
```

### 2. Ensure same WiFi network

- Your phone and computer must be on the **same WiFi network**

### 3. Restart app

```bash
pnpm start -c
```

**Note**: USB with ADB reverse is generally more reliable and faster.

---

## 📱 Backend API Endpoints Available

All endpoints are accessible via `http://localhost:6062/api`:

- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/profile` - Get user profile (requires JWT)
- `GET /products` - Browse products
- `GET /products/:id` - Product details
- `POST /cart` - Add to cart
- `GET /cart` - View cart
- `POST /orders` - Create order
- `GET /wishlist` - View wishlist

---

## 📊 System Info

- **Computer IP**: 192.168.0.7
- **Backend Port**: 6062
- **API URL**: http://localhost:6062/api
- **Device ID**: ce05171511e7892d01
- **Connection**: USB (ADB reverse)

---

## 🔄 Daily Workflow

1. **Connect device via USB**
2. **Run setup script**: `./setup-android-usb.sh`
3. **Start backend**: `npm run dev:backend` (from monorepo root)
4. **Start mobile app**: `pnpm start`
5. **Test on device**

### Note on Reconnection

You need to run `adb reverse tcp:6062 tcp:6062` **every time** you:

- Reconnect the USB cable
- Reboot your phone
- Restart ADB

That's why the `setup-android-usb.sh` script exists - just run it whenever you reconnect!

---

## ✨ Testing Checklist

- [ ] Registration works
- [ ] Login works
- [ ] Product browsing loads
- [ ] Product images display
- [ ] Add to cart works
- [ ] Cart sync works
- [ ] Wishlist works
- [ ] Checkout flow works
- [ ] Currency displays in Guaraníes (₲)
- [ ] Prices show correctly

---

## 🎯 Next Steps

Now that your device is configured, you can:

1. **Test all features** of the e-commerce app
2. **Report bugs** you find
3. **Test performance** on real device (smoother than emulator)
4. **Test different network conditions**
5. **Take screenshots** for documentation

Happy testing! 🚀
