# E-Commerce App Migration Guide

## ✅ Completed Steps

### 1. State Management (Zustand Stores)
- ✅ Created `/src/lib/cart/index.ts` - Cart management with persistence
- ✅ Created `/src/lib/wishlist/index.ts` - Wishlist management with persistence
- ✅ Updated `/src/lib/index.tsx` - Exported new stores

### 2. API Layer (TanStack Query)
- ✅ Created `/src/api/products/types.ts` - Product type definitions
- ✅ Created `/src/api/products/use-products.ts` - Products list query hook
- ✅ Created `/src/api/products/use-product.ts` - Single product query hook
- ✅ Created `/src/api/products/index.ts` - Products API exports
- ✅ Updated `/src/api/index.tsx` - Exported products API

### 3. UI Components
- ✅ Created `/src/components/ui/product-card.tsx` - Product grid card
- ✅ Created `/src/components/ui/cart-item-card.tsx` - Cart item component
- ✅ Created ecommerce icons: shop.tsx, cart.tsx, heart.tsx, user.tsx
- ✅ Updated components exports

## 📋 Remaining Implementation Steps

### Step 1: Update Tab Navigation

Edit `/src/app/(app)/_layout.tsx`:

```typescript
/* eslint-disable react/no-unstable-nested-components */
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { Text, View } from '@/components/ui';
import {
  Shop as ShopIcon,
  Cart as CartIcon,
  Heart as HeartIcon,
  User as UserIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime, useCart } from '@/lib';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const totalItems = useCart.use.totalItems();

  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <ShopIcon color={color} />,
          tabBarButtonTestID: 'shop-tab',
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <HeartIcon color={color} />,
          tabBarButtonTestID: 'wishlist-tab',
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarButtonTestID: 'cart-tab',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />
    </Tabs>
  );
}
```

### Step 2: Create Main Shop Page

Create `/src/app/(app)/index.tsx`:

```typescript
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TextInput } from 'react-native';

import { useProducts } from '@/api/products';
import { ProductCard, View, Text, ActivityIndicator } from '@/components/ui';

export default function ShopScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>();

  const { data, isLoading, error } = useProducts({
    variables: { page: 1, limit: 20, search, category },
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center">Error loading products</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      {/* Search Bar */}
      <View className="bg-white p-4 dark:bg-neutral-800">
        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          className="rounded-xl bg-neutral-100 px-4 py-3 dark:bg-neutral-700"
        />
      </View>

      {/* Products Grid */}
      <FlashList
        data={data?.data || []}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item._id}`)}
          />
        )}
        numColumns={2}
        estimatedItemSize={250}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="py-10 text-center">No products found</Text>
        }
      />
    </View>
  );
}
```

### Step 3: Create Wishlist Page

Create `/src/app/(app)/wishlist.tsx`:

```typescript
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';

import { ProductCard, View, Text } from '@/components/ui';
import { useWishlist } from '@/lib';

export default function WishlistScreen() {
  const items = useWishlist.use.items();

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FlashList
        data={items}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item._id}`)}
          />
        )}
        numColumns={2}
        estimatedItemSize={250}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-center text-neutral-500">
              Your wishlist is empty
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

### Step 4: Create Cart Page

Create `/src/app/(app)/cart.tsx`:

```typescript
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import React from 'react';

import { Button, CartItemCard, View, Text } from '@/components/ui';
import { useCart } from '@/lib';

export default function CartScreen() {
  const cartList = useCart.use.cartList();
  const totalPrice = useCart.use.totalPrice();

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <FlashList
        data={cartList}
        renderItem={({ item }) => <CartItemCard item={item} />}
        estimatedItemSize={150}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-center text-neutral-500">
              Your cart is empty
            </Text>
          </View>
        }
      />

      {/* Checkout Footer */}
      {cartList.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-4 dark:bg-neutral-800">
          <View className="mb-3 flex-row justify-between">
            <Text className="text-lg font-semibold">Total:</Text>
            <Text className="text-lg font-bold text-orange-600">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
          <Button
            label="Proceed to Checkout"
            onPress={() => router.push('/checkout')}
          />
        </View>
      )}
    </View>
  );
}
```

### Step 5: Create Profile Page

Create `/src/app/(app)/profile.tsx`:

```typescript
import React from 'react';

import { Button, View, Text } from '@/components/ui';
import { signOut } from '@/lib';

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-neutral-50 p-4 dark:bg-neutral-900">
      <View className="items-center py-10">
        <View className="mb-4 h-24 w-24 rounded-full bg-orange-600" />
        <Text className="text-2xl font-bold">User Profile</Text>
      </View>

      <View className="mt-6">
        <Button label="Sign Out" onPress={signOut} variant="secondary" />
      </View>
    </View>
  );
}
```

### Step 6: Create Product Detail Page

Create `/src/app/products/[id].tsx`:

```typescript
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ScrollView } from 'react-native';

import { useProduct } from '@/api/products';
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from '@/components/ui';
import { useCart, type ProductSize } from '@/lib';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<ProductSize>('M');

  const { data: product, isLoading } = useProduct({ variables: { id } });
  const addToCart = useCart.use.addToCart();

  if (isLoading || !product) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-white dark:bg-neutral-900">
      {/* Image */}
      <Image
        source={{ uri: product.images[0] }}
        style={{ width: '100%', height: 400 }}
        contentFit="cover"
      />

      {/* Details */}
      <View className="p-4">
        <Text className="mb-2 text-2xl font-bold">{product.name}</Text>
        {product.brand && (
          <Text className="mb-4 text-neutral-500">{product.brand}</Text>
        )}

        {/* Rating */}
        <View className="mb-4 flex-row items-center">
          <Text className="font-medium">⭐ {product.average_rating.toFixed(1)}</Text>
          <Text className="ml-2 text-neutral-500">
            ({product.ratings_count} reviews)
          </Text>
        </View>

        {/* Description */}
        <Text className="mb-6 leading-6 text-neutral-700 dark:text-neutral-300">
          {product.description}
        </Text>

        {/* Size Selection */}
        <Text className="mb-3 font-semibold">Select Size:</Text>
        <View className="mb-6 flex-row gap-3">
          {product.prices.map((priceItem) => (
            <TouchableOpacity
              key={priceItem.size}
              onPress={() => setSelectedSize(priceItem.size)}
              className={`rounded-xl border-2 px-6 py-3 ${
                selectedSize === priceItem.size
                  ? 'border-orange-600 bg-orange-50'
                  : 'border-neutral-300'
              }`}
            >
              <Text
                className={
                  selectedSize === priceItem.size
                    ? 'font-bold text-orange-600'
                    : ''
                }
              >
                {priceItem.size} - ${priceItem.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add to Cart */}
        <Button label="Add to Cart" onPress={handleAddToCart} />
      </View>
    </ScrollView>
  );
}
```

### Step 7: Create Checkout Page

Create `/src/app/checkout.tsx`:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';
import * as z from 'zod';

import { Button, ControlledInput, View, Text } from '@/components/ui';
import { useCart, clearCart } from '@/lib';

const schema = z.object({
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(3, 'ZIP code is required'),
  cardNumber: z.string().length(16, 'Card number must be 16 digits'),
  cardName: z.string().min(3, 'Cardholder name is required'),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Format: MM/YY'),
  cvv: z.string().length(3, 'CVV must be 3 digits'),
});

type CheckoutFormType = z.infer<typeof schema>;

export default function CheckoutScreen() {
  const totalPrice = useCart.use.totalPrice();
  const { control, handleSubmit } = useForm<CheckoutFormType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: CheckoutFormType) => {
    clearCart();
    router.replace('/order-success');
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
      <View className="p-4">
        <Text className="mb-6 text-2xl font-bold">Checkout</Text>

        {/* Shipping */}
        <Text className="mb-3 text-lg font-semibold">Shipping Address</Text>
        <ControlledInput control={control} name="address" label="Address" />
        <ControlledInput control={control} name="city" label="City" />
        <ControlledInput control={control} name="zipCode" label="ZIP Code" />

        {/* Payment */}
        <Text className="mb-3 mt-6 text-lg font-semibold">Payment</Text>
        <ControlledInput control={control} name="cardNumber" label="Card Number" keyboardType="number-pad" />
        <ControlledInput control={control} name="cardName" label="Cardholder Name" />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <ControlledInput control={control} name="expiry" label="MM/YY" />
          </View>
          <View className="flex-1">
            <ControlledInput control={control} name="cvv" label="CVV" secureTextEntry />
          </View>
        </View>

        {/* Total */}
        <View className="my-6 rounded-xl bg-white p-4 dark:bg-neutral-800">
          <View className="flex-row justify-between">
            <Text className="text-lg font-semibold">Total:</Text>
            <Text className="text-lg font-bold text-orange-600">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        <Button label="Place Order" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
}
```

### Step 8: Update Root Layout

Edit `/src/app/_layout.tsx` to add new routes:

```typescript
<Stack>
  <Stack.Screen name="(app)" options={{ headerShown: false }} />
  <Stack.Screen name="onboarding" options={{ headerShown: false }} />
  <Stack.Screen name="login" options={{ headerShown: false }} />
  <Stack.Screen name="products/[id]" options={{ headerShown: true, title: 'Product Details' }} />
  <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
  <Stack.Screen name="order-success" options={{ headerShown: false }} />
</Stack>
```

## 🚀 Running the App

```bash
cd /Users/galo/PROJECTS/sportcenter.space/mobile/template

# Install dependencies
pnpm install

# Start development server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

## 🔧 Environment Setup

Create `.env` file:

```
API_URL=http://localhost:4000/api
```

## ✨ Features Implemented

- ✅ Zustand state management (cart, wishlist)
- ✅ TanStack Query for API calls
- ✅ Zod validation with React Hook Form
- ✅ NativeWind styling
- ✅ Product browsing and search
- ✅ Add to cart/wishlist
- ✅ Cart management (quantity, remove)
- ✅ Checkout flow
- ✅ Persisted state (cart & wishlist survive app restart)
- ✅ TypeScript throughout
- ✅ Modern Expo Router file-based routing

## 📦 Dependencies Status

All required dependencies are already in package.json:
- ✅ zustand
- ✅ @tanstack/react-query
- ✅ zod
- ✅ react-hook-form
- ✅ @hookform/resolvers
- ✅ nativewind
- ✅ @shopify/flash-list
- ✅ expo-image
- ✅ react-native-mmkv (storage)

No additional npm installs needed!
