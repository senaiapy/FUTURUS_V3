# Feature Comparison: Mobile Template vs Frontend Web

## Analysis Summary

After thorough analysis of `/mobile/template` (React Native), `/frontend` (Next.js), and `/backend` (NestJS API), here's the comprehensive feature comparison and implementation plan.

---

## Current Features Matrix

| Feature                 | Mobile Template  | Frontend Web      | Backend API | Status                   |
| ----------------------- | ---------------- | ----------------- | ----------- | ------------------------ |
| **Product Browsing**    | ✅ Basic         | ✅ Advanced       | ✅ Complete | Needs Enhancement        |
| **Product Search**      | ✅ Basic         | ✅ Advanced       | ✅ Complete | Needs Enhancement        |
| **Product Detail**      | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Shopping Cart**       | ✅ Basic (Local) | ✅ Complete (API) | ✅ Complete | **NEEDS API CONNECTION** |
| **Wishlist**            | ✅ Basic (Local) | ✅ Complete (API) | ✅ Complete | **NEEDS API CONNECTION** |
| **Authentication**      | ✅ Basic (Demo)  | ✅ Complete (JWT) | ✅ Complete | **NEEDS REAL AUTH**      |
| **User Registration**   | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **User Profile**        | ✅ Basic         | ✅ Complete       | ✅ Complete | Needs Enhancement        |
| **Checkout**            | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Order Creation**      | ❌ Missing       | ✅ Complete (API) | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Order History**       | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Order Confirmation**  | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Dashboard**           | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Categories**          | ✅ Filter only   | ✅ Full pages     | ✅ Complete | Needs Enhancement        |
| **Brands**              | ✅ Filter only   | ✅ Full pages     | ✅ Complete | Needs Enhancement        |
| **Currency Conversion** | ❌ Missing       | ✅ Complete (₲)   | N/A (USD)   | **NEEDS IMPLEMENTATION** |
| **Payment Methods**     | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **Shipping**            | ❌ Missing       | ✅ Complete       | ✅ Complete | **NEEDS IMPLEMENTATION** |
| **i18n**                | ✅ Ready         | ❌ Setup only     | N/A         | Ready                    |
| **Dark/Light Theme**    | ✅ Complete      | ❌ Missing        | N/A         | Complete                 |
| **Onboarding**          | ✅ Complete      | ❌ Missing        | N/A         | Complete                 |

---

## Missing Features in Mobile Template

### Critical (E-Commerce Essential)

1. **Product Detail Page** ❌
   - Full product information
   - Image gallery
   - Add to cart from detail
   - Related products
   - Stock status
   - Quantity selector

2. **Checkout Flow** ❌
   - Shipping information form
   - Shipping method selection
   - Payment method selection
   - Order summary
   - Order creation

3. **Order Confirmation** ❌
   - Order details display
   - Order status tracking
   - Order ID display
   - Customer information

4. **Order History** ❌
   - List of past orders
   - Order status tracking
   - Order detail view
   - Reorder functionality

5. **User Registration** ❌
   - Registration form
   - Password confirmation
   - Terms & conditions
   - API integration

6. **Real Authentication** ❌
   - JWT token handling
   - Token refresh
   - Auto-logout on expire
   - API interceptor setup

### Important (User Experience)

7. **Dashboard/My Account** ❌
   - Account overview
   - Statistics (orders, spending)
   - Quick links
   - Profile management

8. **Currency Conversion** ❌
   - USD to Guaraníes converter
   - Price formatting utilities
   - Locale-aware display

9. **Categories Page** ❌
   - Category browsing
   - Category filtering
   - Category-specific products

10. **Brands Page** ❌
    - Brand directory
    - Brand filtering
    - Brand-specific products

### Nice-to-Have

11. **About/Info Pages**
    - How to buy
    - Payment methods info
    - Company information
    - Contact page
    - Store locations

12. **Enhanced Search**
    - Filter by price range
    - Sort options
    - Advanced filters

---

## API Integration Comparison

### Current Mobile Template API Usage

**Products:**

```typescript
// mobile/template/src/api/products/
- useProducts() → GET /products (basic pagination)
- useProduct({ id }) → GET /products/:id
```

**Missing:**

- Search by column
- Filter by brand/category
- Price range filtering
- Advanced sorting

### Frontend Web API Usage

**Products:**

```typescript
// frontend/lib/products-api.ts
- getProducts(params) → Full pagination, filters
- getProductById(id)
- getProductBySlug(slug)
- searchProducts(value, params)
- searchByColumn(column, value, params)
```

**Cart:**

```typescript
// frontend/lib/cart-api.ts
- getCart() → API-based cart
- addToCart(productId, quantity)
- updateItem(productId, quantity)
- removeItem(productId)
- clearCart()
```

**Wishlist:**

```typescript
// frontend/lib/wishlist-api.ts
- getWishlist() → API-based
- addToWishlist(productId)
- removeFromWishlist(productId)
- isInWishlist(productId)
```

**Orders:**

```typescript
// frontend/lib/orders-api.ts
- createOrder(data) → Full checkout
- getMyOrders()
- getById(id)
```

**Auth:**

```typescript
// frontend/lib/auth-api.ts
- login(credentials) → JWT
- register(data)
- getProfile()
- logout()
```

### Template Current State

- ✅ Products: Basic fetch (no advanced filters)
- ❌ Cart: Local Zustand only (no API sync)
- ❌ Wishlist: Local Zustand only (no API sync)
- ❌ Orders: Not implemented
- ⚠️ Auth: Demo mode only (no real JWT)

---

## Backend API Requirements

### Available Endpoints (from backend analysis)

**AUTH `/api/auth`:**

- ✅ POST `/register` - Register new user
- ✅ POST `/login` - Login and get JWT
- ✅ GET `/profile` - Get current user
- ✅ PATCH `/profile` - Update profile

**PRODUCTS `/api/products`:**

- ✅ GET `/` - List with filters (page, limit, search, brandId, categoryId, minPrice, maxPrice, tags, sortBy, sortOrder)
- ✅ GET `/:id` - Get by ID
- ✅ GET `/slug/:slug` - Get by slug
- ✅ GET `/search/value/:value` - Search
- ✅ GET `/search/column/:column/:value` - Advanced search

**CART `/api/cart`:** (JWT required)

- ✅ GET `/` - Get user's cart
- ✅ POST `/` - Add product { productId, quantity }
- ✅ PATCH `/:productId` - Update quantity
- ✅ DELETE `/:productId` - Remove item
- ✅ DELETE `/` - Clear cart

**WISHLIST `/api/wishlist`:** (JWT required)

- ✅ GET `/` - Get user's wishlist
- ✅ POST `/` - Add product { productId }
- ✅ GET `/check/:productId` - Check if in wishlist
- ✅ DELETE `/:productId` - Remove item
- ✅ DELETE `/` - Clear wishlist

**ORDERS `/api/orders`:** (JWT required)

- ✅ POST `/` - Create order (checkout)
- ✅ GET `/my-orders` - Get user's orders
- ✅ GET `/:id` - Get order by ID

**CATEGORIES `/api/categories`:**

- ✅ GET `/` - List all
- ✅ GET `/:id` - Get by ID
- ✅ GET `/slug/:slug` - Get by slug
- ✅ GET `/:id/products` - Get category products

**BRANDS `/api/brands`:**

- ✅ GET `/` - List all
- ✅ GET `/:id` - Get by ID
- ✅ GET `/slug/:slug` - Get by slug
- ✅ GET `/:id/products` - Get brand products

---

## Implementation Plan

### Phase 1: API Connection Setup ✅ Priority: CRITICAL

**Task 1.1: Update Axios Client**

- File: `/src/api/common/client.tsx`
- Change base URL from `http://localhost:4000/api` to `http://localhost:6062/api`
- Add JWT token interceptor
- Add response error handling (401 auto-logout)

**Task 1.2: Create Auth API Service**

- File: `/src/api/auth/`
- Implement: login, register, getProfile, logout
- Token storage in MMKV
- Auto-refresh on app start

**Task 1.3: Update useAuth Store**

- File: `/src/lib/auth/index.tsx`
- Connect to real API instead of demo mode
- Implement actual JWT token validation
- Add token refresh logic

### Phase 2: Implement Missing Core Pages ✅ Priority: CRITICAL

**Task 2.1: Product Detail Page**

- Route: `/product/[id]`
- File: `/src/app/product/[id].tsx`
- Features:
  - Full product information
  - Image gallery
  - Add to cart button
  - Quantity selector
  - Stock status
  - Related products
- Use ProductDetail API hook

**Task 2.2: User Registration Page**

- Route: `/register` or `/auth/register`
- File: `/src/app/register.tsx`
- Features:
  - Registration form (name, email, password, confirm password)
  - Form validation with Zod
  - Terms & conditions checkbox
  - API integration
  - Success redirect to login

**Task 2.3: Checkout Page**

- Route: `/checkout`
- File: `/src/app/checkout.tsx`
- Features:
  - Shipping information form
  - City selector (8 major cities)
  - Shipping cost calculation
  - Payment method selection
  - Order summary
  - Create order API call
  - Redirect to confirmation

**Task 2.4: Order Confirmation Page**

- Route: `/order-confirmation?orderId=[id]`
- File: `/src/app/order-confirmation.tsx`
- Features:
  - Order details display
  - Customer information
  - Order items list
  - Totals breakdown
  - Status badge
  - Continue shopping button

**Task 2.5: Orders History / Dashboard**

- Route: `/dashboard` or `/mi-cuenta`
- File: `/src/app/dashboard.tsx`
- Features:
  - Statistics cards (orders, spending, wishlist)
  - Recent orders list
  - Profile information
  - Navigation sidebar

### Phase 3: API-Connected State Management ✅ Priority: HIGH

**Task 3.1: Cart API Integration**

- Update: `/src/lib/cart/index.ts`
- Replace local Zustand with API calls
- Sync on app start
- Optimistic updates
- Error handling

**Task 3.2: Wishlist API Integration**

- Update: `/src/lib/wishlist/index.ts`
- Replace local Zustand with API calls
- Sync on app start
- Optimistic updates

**Task 3.3: Create Orders API Hooks**

- File: `/src/api/orders/`
- `useCreateOrder()` - Create order mutation
- `useMyOrders()` - Get user orders query
- `useOrder({ id })` - Get single order query

### Phase 4: Enhanced Product Features ✅ Priority: MEDIUM

**Task 4.1: Advanced Products API**

- Update: `/src/api/products/use-products.ts`
- Add filters: brandId, categoryId, minPrice, maxPrice
- Add sorting options
- Add search by column

**Task 4.2: Categories Page**

- Route: `/categories` or `/categorias`
- File: `/src/app/categories.tsx`
- Features:
  - List all categories
  - Category cards
  - Product count per category
  - Navigate to category products

**Task 4.3: Category Products Page**

- Route: `/categories/[id]`
- File: `/src/app/categories/[id].tsx`
- Features:
  - Category name header
  - Filtered products
  - Pagination
  - Breadcrumb navigation

**Task 4.4: Brands Page**

- Route: `/brands` or `/marcas`
- File: `/src/app/brands.tsx`
- Features:
  - List all brands
  - Brand cards with logo
  - Product count per brand

**Task 4.5: Brand Products Page**

- Route: `/brands/[id]`
- File: `/src/app/brands/[id].tsx`
- Similar to category products

### Phase 5: Currency & Localization ✅ Priority: MEDIUM

**Task 5.1: Currency Converter**

- File: `/src/lib/currency.ts`
- Copy from frontend: `convertAndFormatPrice()`
- USD to Guaraníes conversion (1 USD = 7,300 ₲)
- Brazilan locale formatting

**Task 5.2: Update Price Displays**

- Update ProductCard component
- Update CartItemCard component
- Update all price displays throughout app

**Task 5.3: Spanish/Portuguese i18n**

- Update translation files
- Add currency symbols
- Brazilan Spanish locale

### Phase 6: Profile & Settings Enhancement ✅ Priority: LOW

**Task 6.1: Enhanced Profile Page**

- Update: `/src/app/(app)/profile.tsx`
- Editable fields (name, email, phone, address)
- Save changes API call
- Password change form

**Task 6.2: Settings Enhancement**

- Update: `/src/app/(app)/settings.tsx`
- Add notification preferences
- Add shipping address management

### Phase 7: Additional Features ✅ Priority: LOW

**Task 7.1: Info Pages**

- `/como-comprar` - How to buy
- `/formas-de-pago` - Payment methods
- `/la-empresa` - About company
- `/contacto` - Contact
- `/sucursales` - Store locations

**Task 7.2: Enhanced Search**

- Search bar component
- Search results page
- Filter by category/brand
- Price range slider

---

## Technical Requirements

### Dependencies to Keep (From Template)

- ✅ zustand - State management
- ✅ @tanstack/react-query - Data fetching
- ✅ react-query-kit - Type-safe query hooks
- ✅ axios - HTTP client
- ✅ react-hook-form + zod - Forms & validation
- ✅ nativewind - Styling (Tailwind CSS)
- ✅ react-native-mmkv - Storage
- ✅ expo-router - Navigation
- ✅ lucide-react-native - Icons

### New Dependencies NOT Needed

- ❌ NextAuth (web-only)
- ❌ TanStack Query (already have react-query)

### Environment Variables

Update `.env.development`:

```bash
API_URL=http://localhost:6062/api        # Backend port 6062
API_URL=http://10.0.2.2:6062/api         # Android emulator
```

Update `.env.production`:

```bash
API_URL=https://api.futurus.com.br/api
```

---

## Data Type Mapping

### Backend → Frontend Type Conversion

**Product:**

```typescript
// Backend (Prisma)
Product {
  id: string (CUID)
  name: string
  slug: string
  description: string
  price: number (USD)
  stock: number
  price_sale?: string
  stockStatus: string
  stockQuantity: string
  specifications?: string
  details?: string
  referenceId?: string
  tags: string[]
  brandId: string
  categoryId: string
  brand?: Brand
  category?: Category
  images: ProductImage[]
}

// Mobile Template (Current - NEEDS UPDATE)
CartProduct {
  _id: string                  // ← Change to 'id'
  name: string                 // ✅ Keep
  description: string          // ✅ Keep
  images: string[]             // ← Change to ProductImage[]
  prices: ItemPrice[]          // ← Remove (use price directly)
  category: string             // ← Change to Category object
  brand?: string               // ← Change to Brand object
  average_rating: number       // ← Add if backend has ratings
  ratings_count: string        // ← Add if backend has ratings
  selectedSize?: ProductSize   // ← Remove (not in backend)
}

// Should become:
Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  stock: number
  price_sale?: number
  stockStatus: string
  stockQuantity: number
  specifications?: string
  details?: string
  referenceId?: string
  tags: string[]
  brandId: string
  categoryId: string
  brand?: Brand
  category?: Category
  images: ProductImage[]
}
```

**Cart:**

```typescript
// Backend
Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: DateTime
  updatedAt: DateTime
}

CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}

// Mobile Template (Local - NEEDS REPLACEMENT)
cartList: CartProduct[]  // ← Replace with API-based Cart

// Should become:
cart: {
  id: string
  items: Array<{
    id: string
    product: Product
    quantity: number
  }>
  totalItems: number
  totalPrice: number
}
```

**Wishlist:**

```typescript
// Backend
Wishlist {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: DateTime
}

// Mobile Template (Local - NEEDS REPLACEMENT)
items: CartProduct[]  // ← Replace with API-based Wishlist

// Should become:
wishlist: Array<{
  id: string
  productId: string
  product: Product
  createdAt: string
}>
```

**Order:**

```typescript
// Backend
Order {
  id: string
  userId: string
  total: number
  subtotal: number
  tax: number
  shippingCost: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  shippingAddress: string
  shippingCity: string
  shippingCountry: string
  postalCode?: string
  phone: string
  notes?: string
  items: OrderItem[]
  createdAt: DateTime
  updatedAt: DateTime
}

OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  product: Product
}

// Mobile Template (NEEDS IMPLEMENTATION)
// Create matching TypeScript interface
```

---

## File Structure After Implementation

```
/mobile/template/src/
├── api/
│   ├── auth/
│   │   ├── use-login.ts              ← NEW
│   │   ├── use-register.ts           ← NEW
│   │   ├── use-profile.ts            ← NEW
│   │   └── types.ts                  ← NEW
│   ├── cart/
│   │   ├── use-cart.ts               ← NEW (API-based)
│   │   ├── use-add-to-cart.ts        ← NEW
│   │   ├── use-update-cart.ts        ← NEW
│   │   └── types.ts                  ← NEW
│   ├── wishlist/
│   │   ├── use-wishlist.ts           ← NEW
│   │   ├── use-toggle-wishlist.ts    ← NEW
│   │   └── types.ts                  ← NEW
│   ├── orders/
│   │   ├── use-create-order.ts       ← NEW
│   │   ├── use-my-orders.ts          ← NEW
│   │   ├── use-order.ts              ← NEW
│   │   └── types.ts                  ← NEW
│   ├── categories/
│   │   ├── use-categories.ts         ← NEW
│   │   ├── use-category.ts           ← NEW
│   │   └── types.ts                  ← NEW
│   ├── brands/
│   │   ├── use-brands.ts             ← NEW
│   │   ├── use-brand.ts              ← NEW
│   │   └── types.ts                  ← NEW
│   └── products/
│       ├── use-products.ts           ← UPDATE (add filters)
│       ├── use-product.ts            ← Keep
│       └── types.ts                  ← UPDATE
├── app/
│   ├── (app)/
│   │   ├── index.tsx                 ← UPDATE (products)
│   │   ├── cart.tsx                  ← UPDATE (API integration)
│   │   ├── wishlist.tsx              ← UPDATE (API integration)
│   │   ├── profile.tsx               ← UPDATE (editable)
│   │   └── settings.tsx              ← Keep
│   ├── product/
│   │   └── [id].tsx                  ← NEW
│   ├── checkout.tsx                  ← NEW
│   ├── order-confirmation.tsx        ← NEW
│   ├── dashboard.tsx                 ← NEW
│   ├── register.tsx                  ← NEW
│   ├── categories/
│   │   ├── index.tsx                 ← NEW
│   │   └── [id].tsx                  ← NEW
│   ├── brands/
│   │   ├── index.tsx                 ← NEW
│   │   └── [id].tsx                  ← NEW
│   └── login.tsx                     ← UPDATE (real auth)
├── lib/
│   ├── auth/
│   │   └── index.tsx                 ← UPDATE (API integration)
│   ├── cart/
│   │   └── index.ts                  ← UPDATE (API sync)
│   ├── wishlist/
│   │   └── index.ts                  ← UPDATE (API sync)
│   ├── currency.ts                   ← NEW
│   └── ...
└── components/
    ├── ui/
    │   ├── product-card.tsx          ← UPDATE (currency)
    │   ├── cart-item-card.tsx        ← UPDATE (API integration)
    │   └── ...
    ├── checkout-form.tsx             ← NEW
    ├── order-summary.tsx             ← NEW
    └── ...
```

---

## Testing Strategy

1. **API Connection:**
   - Test backend running on port 6062
   - Test JWT token storage/retrieval
   - Test auto-logout on 401

2. **Cart Sync:**
   - Test add to cart (API)
   - Test local fallback if offline
   - Test cart persistence

3. **Wishlist Sync:**
   - Test add/remove (API)
   - Test optimistic updates

4. **Checkout Flow:**
   - Test shipping form validation
   - Test order creation
   - Test redirect to confirmation

5. **Authentication:**
   - Test login with valid credentials
   - Test registration
   - Test token refresh
   - Test profile updates

---

## Success Criteria

✅ **Phase 1 Complete:**

- Axios connected to backend (port 6062)
- JWT token interceptor working
- Auth API integrated

✅ **Phase 2 Complete:**

- Product detail page functional
- Checkout flow works end-to-end
- Orders can be created
- Order confirmation displays correctly
- Registration working

✅ **Phase 3 Complete:**

- Cart syncs with backend
- Wishlist syncs with backend
- Offline fallback working

✅ **Phase 4 Complete:**

- Advanced product filters working
- Categories page functional
- Brands page functional

✅ **Phase 5 Complete:**

- Prices display in Guaraníes (₲)
- Currency conversion working

✅ **Full Integration:**

- Mobile app has feature parity with frontend web
- All e-commerce flows functional
- Connected to same backend as web

---

## Timeline Estimate

| Phase     | Tasks                | Estimated Time  |
| --------- | -------------------- | --------------- |
| Phase 1   | API Connection Setup | 2-3 hours       |
| Phase 2   | Core Pages (5 pages) | 8-10 hours      |
| Phase 3   | API State Management | 4-5 hours       |
| Phase 4   | Enhanced Features    | 6-8 hours       |
| Phase 5   | Currency & i18n      | 2-3 hours       |
| Phase 6   | Profile Enhancement  | 2-3 hours       |
| Phase 7   | Additional Features  | 4-6 hours       |
| **Total** |                      | **28-38 hours** |

---

## Next Steps

1. **Immediate:** Start with Phase 1 (API Connection)
2. **Then:** Implement Phase 2 (Core Pages) for MVP
3. **After:** Complete Phase 3 (API Sync) for full integration
4. **Finally:** Polish with Phases 4-7

**Ready to start implementation?** Begin with Phase 1, Task 1.1.
