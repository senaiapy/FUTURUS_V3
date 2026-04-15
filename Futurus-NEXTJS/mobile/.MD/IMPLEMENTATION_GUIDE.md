# Implementation Guide: Complete E-Commerce Mobile App

This guide provides step-by-step instructions to implement all missing e-commerce features in the mobile template, matching the frontend web functionality while using the same backend API.

---

## Overview

**Goal:** Transform `/mobile/template` into a full-featured e-commerce app with the same capabilities as `/frontend`, connected to `/backend` API (port 6062).

**Key Principles:**

1. Keep all template's modern libraries (Zustand, TanStack Query, NativeWind, Zod)
2. Connect to existing backend API at `http://localhost:6062/api`
3. Match frontend functionality (checkout, orders, currency conversion)
4. Maintain mobile-first UX with template's design system

---

## Phase 1: API Connection & Authentication ✅

### Step 1.1: Update Axios Client ✅ COMPLETED

File: `/src/api/common/client.tsx`

**Status:** ✅ Already updated with:

- JWT token interceptor (adds `Authorization: Bearer <token>` header)
- 401 error handling (auto-logout on unauthorized)
- Event dispatch for auth state changes

### Step 1.2: Create Auth API Service

Create file: `/src/api/auth/use-login.ts`

```typescript
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { LoginRequest, AuthResponse } from './types';

type Variables = LoginRequest;
type Response = AuthResponse;

export const useLogin = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) =>
    client.post(`/auth/login`, variables).then((response) => response.data),
});
```

Create file: `/src/api/auth/use-register.ts`

```typescript
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '../common';
import type { RegisterRequest, AuthResponse } from './types';

type Variables = RegisterRequest;
type Response = AuthResponse;

export const useRegister = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) =>
    client.post(`/auth/register`, variables).then((response) => response.data),
});
```

Create file: `/src/api/auth/use-profile.ts`

```typescript
import { createQuery } from 'react-query-kit';

import { client } from '../common';
import type { User } from './types';

type Response = User;

export const useProfile = createQuery<Response>({
  queryKey: ['profile'],
  fetcher: () => client.get(`/auth/profile`).then((response) => response.data),
});
```

Create file: `/src/api/auth/types.ts`

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface TokenType {
  access: string;
  refresh?: string;
}
```

Create file: `/src/api/auth/index.ts`

```typescript
export * from './use-login';
export * from './use-register';
export * from './use-profile';
export * from './types';
```

### Step 1.3: Update Auth Store

Update file: `/src/lib/auth/index.tsx`

```typescript
import { create } from 'zustand';

import { createSelectors } from '../utils';
import type { TokenType } from './utils';
import { getToken, removeToken, setToken } from './utils';

interface AuthState {
  token: TokenType | null;
  status: 'idle' | 'signOut' | 'signIn';
  user: any | null;
  signIn: (data: { token: TokenType; user: any }) => void;
  signOut: () => void;
  hydrate: () => void;
  setUser: (user: any) => void;
}

const _useAuth = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (data) => {
    setToken(data.token);
    set({ status: 'signIn', token: data.token, user: data.user });
  },
  signOut: () => {
    removeToken();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      if (userToken !== null) {
        get().signIn({ token: userToken, user: null });
      } else {
        get().signOut();
      }
    } catch (e) {
      // catch error here
      // Maybe sign_out user!
    }
  },
  setUser: (user) => set({ user }),
}));

export const useAuth = createSelectors(_useAuth);

export const signOut = () => _useAuth.getState().signOut();
export const signIn = (data: { token: TokenType; user: any }) =>
  _useAuth.getState().signIn(data);
export const hydrateAuth = () => _useAuth.getState().hydrate();
```

### Step 1.4: Update Login Form

Update file: `/src/components/login-form.tsx`

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import * as z from 'zod';

import { useLogin } from '@/api/auth';
import { signIn } from '@/lib/auth';

import { Button, ControlledInput, View } from './ui';

const schema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
    })
    .email('Invalid email format'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const router = useRouter();
  const { mutate: login, isPending } = useLogin();

  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  const onSubmitForm: SubmitHandler<FormType> = (data) => {
    login(data, {
      onSuccess: (response) => {
        signIn({
          token: { access: response.access_token },
          user: response.user,
        });
        router.replace('/');
      },
      onError: (error: any) => {
        Alert.alert(
          'Login Failed',
          error.response?.data?.message || 'Invalid credentials'
        );
      },
    });
    onSubmit(data);
  };

  return (
    <View className="flex-1 justify-center p-4">
      <ControlledInput
        testID="email-input"
        control={control}
        name="email"
        label="Email"
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <ControlledInput
        testID="password-input"
        control={control}
        name="password"
        label="Password"
        placeholder="Enter your password"
        secureTextEntry
      />
      <Button
        testID="login-button"
        label={isPending ? 'Logging in...' : 'Login'}
        onPress={handleSubmit(onSubmitForm)}
        loading={isPending}
      />
    </View>
  );
};
```

---

## Phase 2: Core E-Commerce Pages

### Step 2.1: Product Detail Page

Create file: `/src/app/product/[id].tsx`

```typescript
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProduct } from '@/api/products';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { Button } from '@/components/ui';
import { Heart } from '@/components/ui/icons';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct({ variables: { id: id! } });
  const { addToCart } = useCart.use.actions();
  const { toggleWishlist, isInWishlist } = useWishlist.use.actions();
  const inWishlist = useWishlist.use.isInWishlist()(id);

  const [quantity, setQuantity] = React.useState(1);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-center text-lg">Product not found</Text>
        <Button label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert('Success', `${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-900">
      <ScrollView className="flex-1">
        {/* Product Image */}
        <View className="relative h-96 w-full bg-neutral-100">
          <Image
            source={{ uri: product.images?.[0]?.url || 'https://via.placeholder.com/400' }}
            className="h-full w-full"
            resizeMode="cover"
          />
          {/* Wishlist Button */}
          <Button
            className="absolute right-4 top-4 h-12 w-12 rounded-full bg-white"
            onPress={() => toggleWishlist(product)}
          >
            <Heart color={inWishlist ? 'red' : 'black'} fill={inWishlist ? 'red' : 'none'} />
          </Button>
        </View>

        {/* Product Info */}
        <View className="p-4">
          {/* Brand */}
          {product.brand && (
            <Text className="mb-2 text-sm text-neutral-500">{product.brand.name}</Text>
          )}

          {/* Name */}
          <Text className="mb-2 text-2xl font-bold text-neutral-900 dark:text-white">
            {product.name}
          </Text>

          {/* Price */}
          <Text className="mb-4 text-3xl font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </Text>

          {/* Stock Status */}
          <View className="mb-4">
            {product.stock > 0 ? (
              <Text className="text-green-600">In Stock ({product.stock} available)</Text>
            ) : (
              <Text className="text-red-600">Out of Stock</Text>
            )}
          </View>

          {/* Quantity Selector */}
          <View className="mb-6 flex-row items-center">
            <Text className="mr-4 text-lg">Quantity:</Text>
            <Button
              label="-"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-10 w-10"
            />
            <Text className="mx-4 text-xl">{quantity}</Text>
            <Button
              label="+"
              onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="h-10 w-10"
            />
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <Button
              label="Add to Cart"
              onPress={handleAddToCart}
              disabled={product.stock === 0}
            />
            <Button
              label="Buy Now"
              variant="secondary"
              onPress={handleBuyNow}
              disabled={product.stock === 0}
            />
          </View>

          {/* Description */}
          {product.description && (
            <View className="mt-6">
              <Text className="mb-2 text-xl font-bold">Description</Text>
              <Text className="text-neutral-700 dark:text-neutral-300">
                {product.description}
              </Text>
            </View>
          )}

          {/* Specifications */}
          {product.specifications && (
            <View className="mt-6">
              <Text className="mb-2 text-xl font-bold">Specifications</Text>
              <Text className="text-neutral-700 dark:text-neutral-300">
                {product.specifications}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

Due to length constraints, I'll provide the remaining implementation steps in a summary format. Would you like me to:

1. Create all the remaining implementation files (registration, checkout, orders, etc.) step by step?
2. Or provide a complete implementation package as a downloadable guide?

The complete implementation would include:

- Registration page with form validation
- Checkout page with shipping/payment
- Order confirmation page
- Dashboard/My Account page
- API services for cart, wishlist, orders
- Currency conversion utilities
- Updated product types to match backend

Let me know how you'd like to proceed!
