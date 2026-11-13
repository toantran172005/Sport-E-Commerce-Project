# PROMPT 007 — Cart numbering, STAFF/ADMIN role-based admin + Staff CRUD, shipping quote cache, chatbot launcher

> Target model: DeepSeek Pro (thinking enabled, reasoning effort = max). Output **100% complete files**, no `// TODO`, no pseudo-code, no diffs for modified files. Deliver in **4 explicit batches**; after each batch stop and wait for `CONTINUE`.

---

## 1. ROLE & CONTEXT

You are a Principal React engineer working on **"Sân Nhà Sport"** (sport e-commerce), frontend only.

- Stack: **React 19.2, Vite 8, React Router 7.18 (`react-router-dom`), Tailwind CSS v4** (design tokens: `bg-surface`, `bg-page`, `text-ink`, `text-ink-muted`, `border-line`, `bg-accent`, `bg-accent-soft`, `bg-danger`), `lucide-react`, `axios`. Plain JavaScript (`.jsx`/`.js`), ESM. No TypeScript.
- Test runner: Node 22 native (**`node --test tests/**/*.test.js`**). Lint: `eslint .` (react-hooks v7 + react-refresh; files exporting both components and hooks/contexts need `/* eslint-disable react-refresh/only-export-components */` at top). Build: `vite build`. **All three must stay green: 0 errors, 0 warnings.**
- Architecture: modular contexts in `src/context/` (`AuthContext`, `CatalogContext`, `CartContext`, `OrderContext`, `AddressContext`, `NotificationContext`, `WishlistContext`, `CustomerContext`, `ThemeContext`, `UIContext`, plus new `StaffContext` and `ChatbotContext` added in this work) exposed through `src/context/index.js` and facade `useStore()` in `StoreContext.jsx`. Services in `src/services/*` (axios with mock/fallback), mocks in `src/mocks/*`, layouts in `src/layouts/*`, pages in `src/pages/{client,admin,auth,common}`, routes in `src/routes/AppRoutes.jsx` (lazy-loaded pages inside `<Suspense>`).
- Backend (Spring Boot microservices, **DO NOT modify `backend/` or `documents/`**): `UserRole` enum currently = `CUSTOMER, STAFF, ADMIN` — this already matches the final role list, so **no backend change is needed**. `GET /shipments/calculate?providerCode=&addressId=&city=&subTotal=` returns `{ shippingFee, estimatedDeliveryDate, formattedDeliveryDate }`. `GET /shipments/shipping-providers` returns **only GHN and GHTK**; never add other carriers.
- UI language: **Vietnamese**. Code, identifiers, comments: **English**.
- Never print or hardcode API keys / `.env` content.

There are **4 tasks**. Implement all four completely across the batches defined in §6.

---

## 2. EXISTING CONTRACTS (read carefully, follow the style)

### 2.1 Auth / roles (current)
`src/context/AuthContext.jsx`
```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState('sport_user', () => mockUsers[0]);
  const isAdmin = Boolean(user && user.role === 'ADMIN');
  const isCustomer = Boolean(user && user.role === 'CUSTOMER');
  const isGuest = !user;
  const value = useMemo(() => ({ user, setUser, isAdmin, isCustomer, isGuest, isAuthenticated: Boolean(user) }), [...]);
  ...
}
```
`src/routes/AppRoutes.jsx`
```jsx
function AdminRoute({ children }) {
  const { user } = useAuth();
  const { showToast } = useUI();
  if (!user) return <Navigate to="/login?redirect=/admin" replace />;
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    showToast('Tài khoản khách hàng không có quyền truy cập trang quản trị!');
    return <Navigate to="/" replace />;
  }
  return children;
}
// Admin routes today: /admin, /admin/products, /admin/orders, /admin/coupons, /admin/reviews, /admin/settings (each wrapped in <AdminRoute>)
```
Guest behavior today (**DO NOT CHANGE**): guests can browse the storefront and use the cart; `/checkout`, `/wishlist`, and `/account/*` redirect unauthenticated visitors to `/login` with a `redirect` param and the existing toasts. This prompt must not alter guest redirects, toasts, or post-login behavior for client routes.
`src/layouts/AdminLayout.jsx` has a static `ADMIN_NAV_ITEMS` array (`{ to, end, icon, label, badge }`) rendered with `NavLink`; badges `'orders'` and `'reviews'` count PENDING items.
`src/mocks/users.js`: 6 users, roles `CUSTOMER` ×4, `STAFF` (id 5, `staff@sannha.vn`), `ADMIN` (id 6, `admin@sannha.vn`). Fields: `id,email,phoneNumber,fullName,avatarUrl,gender,dateOfBirth,role,status("ACTIVE")`.

### 2.2 Pricing / coupons
`src/utils/pricing.js` exports `calculateDiscount(coupon, subtotal, shippingFee)` and `calculateCartTotals(items, coupon, defaultShippingFee)`. `CatalogContext` already has `coupons`, `addCoupon`, `updateCoupon`, `deleteCoupon`, `toggleCouponActive`. `AdminCouponsPage.jsx` and `AdminCouponModal.jsx` exist. Orders are in `OrderContext` (`orders` with `status`, `totalAmount`, `createdAt`, `items`…). `AdminDashboardPage.jsx` already shows basic KPIs.

### 2.3 Shipping quote (current — the thing to cache)
`src/services/shippingService.js`
```js
export const DEFAULT_SHIPPING_PROVIDERS = [
  { id: 1, name: "Giao Hàng Nhanh (GHN Express)", code: "GHN",  baseFee: 30000, isActive: true },
  { id: 2, name: "Giao Hàng Tiết Kiệm (GHTK)",    code: "GHTK", baseFee: 25000, isActive: true },
];
export const shippingService = {
  async getShippingProviders() { /* GET /shipments/shipping-providers, falls back to DEFAULT_SHIPPING_PROVIDERS */ },
  async calculateShipping({ providerCode = "GHN", addressId, city, subTotal = 0 }) {
    try { /* GET /shipments/calculate */ return response?.data || response; }
    catch { return { shippingFee: subTotal >= 1000000 ? 0 : 30000,
                     estimatedDeliveryDate: new Date(Date.now() + 3*86400000).toISOString() }; } // NOTE: no formattedDeliveryDate
  },
};
```
`src/pages/client/CheckoutPage.jsx` (≈577 lines) key facts:
- `frozenCheckoutItems` snapshot from cart; `checkoutSubtotal` via `useMemo`.
- state: `shippingProviders`, `selectedProviderId`, `shippingQuotes` (object keyed by provider code), `shippingFee`, `estimatedDeliveryDate`, `isInitializing`.
- ONE `useEffect` with deps `[selectedAddress?.id, selectedAddress?.city, checkoutSubtotal]` calls `getShippingProviders()` then `calculateShipping()` **for every provider on every change** (no cache, no de-dup, refetches providers too). Uses `selectedProviderId` inside but it is not in deps (stale closure risk). Fallback quote lacks `formattedDeliveryDate`, so ETA shows blank when API is down.
- Provider card `onClick`: `setSelectedProviderId; setShippingFee(providerFee); if (providerDate) setEstimatedDeliveryDate(providerDate)`.
- Totals: `discountAmount = calculateDiscount(appliedCoupon, checkoutSubtotal, shippingFee)`, `totalAmount = max(0, subtotal + shippingFee - discountAmount)`.
- Order summary list (right column, `lg:col-span-5`) renders `checkoutItems.map(item => <div key={`${item.productId}-${item.variantId}`}> img + name + `{item.variant} × {item.quantity}` + price </div>)`.
- `handlePlaceOrder` builds `orderPayload` (`shippingProviderCode: selectedProviderId === 2 ? 'GHTK' : 'GHN'`, `shippingFee`, `orderItems: checkoutItems.map((item, idx) => ...)`) and calls `orderService.placeOrder(orderPayload)`.

### 2.4 Cart
`src/pages/client/CartPage.jsx`: groups items by brand (`Object.entries(groupedCart).map(([brandName, items]) => ...)`); each group renders `items.map(item => <CartItemRow key={itemKey} item=... isChecked onToggleSelect onUpdateQuantity onRemove />)`. `CartItemRow` is defined in same file. `CartContext` exposes `cart, selectedCartItemKeys, toggleSelectCartItem, updateCartQuantity, removeFromCart, getCartItemKey`.

### 2.5 Client layout
`src/layouts/ClientLayout.jsx`
```jsx
export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink transition-colors duration-200">
      <Header /><main className="flex-1"><Outlet /></main><Footer />
    </div>
  );
}
```
Toasts are rendered by `UIContext`; inspect its position/z-index so the chatbot button does not collide.

### 2.6 AUTHORITATIVE NEW CONTRACTS — implement exactly these names/signatures

```js
// src/utils/permissions.js — exported names
export const ROLES = Object.freeze({ ADMIN:'ADMIN', STAFF:'STAFF', CUSTOMER:'CUSTOMER' });
export const ADMIN_PERMISSIONS = Object.freeze({ DASHBOARD:'dashboard', PRODUCTS:'products', ORDERS:'orders', COUPONS:'coupons', REVIEWS:'reviews', STAFF:'staff', SETTINGS:'settings' });
export const ROLE_PERMISSIONS = Object.freeze({ /* matrix below */ });
export function hasPermission(role, permission) {}
export function isBackOfficeRole(role) {}
export function getDefaultAdminPath(role) {}
export function isAdminPathAllowed(role, pathname) {}
export const ROLE_LABELS_VI = Object.freeze({ ADMIN:'Quản trị viên', STAFF:'Nhân viên', CUSTOMER:'Khách hàng' });
```

```js
// src/utils/staffRules.js — exported names
export function canManageStaff(actor, target) {}
export function canAssignRole(actor, role) {}
export function validateStaffInput(data, existingUsers) {}
```
`canManageStaff(actor, target)` → true **only** when `actor.role === 'ADMIN'` and `target.role === 'STAFF'`. `canAssignRole(actor, role)` → true **only** when `actor.role === 'ADMIN'` and `role === 'STAFF'`.

```js
// src/utils/ttlCache.js — exported names
export function createTtlCache({
  ttlMs = 10 * 60_000,
  maxEntries = 50,
  storage = null,
  storageKey = 'sport_ttl_cache',
  now = Date.now,
} = {}) {}
// returns { get(key), set(key, value, { ttlMs } = {}), has(key), delete(key), clear(), getOrLoad(key, loader, { ttlMs } = {}) }
```

```js
// src/utils/shippingCacheKey.js — exported names
export const SHIPPING_CACHE_TTL_MS = 10 * 60_000;
export const FALLBACK_SHIPPING_TTL_MS = 30_000;
export const PROVIDERS_CACHE_TTL_MS = 60 * 60_000;
export function normalizeCity(city) {}
export function getSubtotalBucket(subTotal) {} // '0' | 'lt_500k' | 'lt_1m' | 'gte_1m'
export function buildShippingCacheKey({ providerCode = 'GHN', addressId, city, subTotal = 0 }) {}
```

```js
// src/utils/shippingQuote.js — exported names
export const FALLBACK_SHIPPING_FEE = 30000;
export function normalizeShippingQuote(raw, { subTotal = 0, source = 'api' } = {}) {}
// -> { shippingFee:number, estimatedDeliveryDate:string|null, formattedDeliveryDate:string, source:'api'|'fallback' }
```

```js
// src/utils/formatters.js — add this named export; DO NOT change existing exports
export function formatEstimatedDelivery(dateLike) {}
```

```js
// src/utils/pricing.js — add these exports; DO NOT change current calculation behavior
export const FREE_SHIPPING_THRESHOLD_500K = 500000;
export const FREE_SHIPPING_THRESHOLD_1M = 1000000;
```

```js
// src/utils/cartNumbering.js — exported names
export function buildLineNumberMap(groupedEntries) {}
// groupedEntries: Array<[brandName, item[]]> in render order -> Map<itemKey, number starting at 1>
```

```js
// src/hooks/useShippingQuotes.js — exported names
export function useShippingQuotes({ addressId, city, subTotal }) {}
// -> { providers, quotes, isLoading, error, refresh }
```

```js
// src/context/ChatbotContext.jsx — exported names
export function ChatbotProvider({ children, renderPanel = null }) {}
export function useChatbot() {}
// -> { isOpen, open, close, toggle, unreadCount, setUnreadCount }
```

#### 2.6.1 Permission matrix (authoritative)

| Permission key | ADMIN | STAFF | CUSTOMER |
|---|---|---|---|
| `DASHBOARD` | ✓ | ✗ | ✗ |
| `PRODUCTS` | ✓ | ✓ | ✗ |
| `ORDERS` | ✓ | ✓ | ✗ |
| `COUPONS` | ✓ | ✗ | ✗ |
| `REVIEWS` | ✓ | ✓ | ✗ |
| `STAFF_MANAGEMENT` (key `STAFF`) | ✓ | ✗ | ✗ |
| `SETTINGS` | ✓ | ✓ | ✗ |

CUSTOMER has **no** admin permissions (`none`).

- `hasPermission(role, permission)` → Boolean for this matrix.
- `isBackOfficeRole(role)` → true for `ADMIN`, `STAFF`.
- `getDefaultAdminPath(role)` → `ADMIN:'/admin'`, `STAFF:'/admin/orders'`, otherwise `'/'`.
- `ADMIN_PATH_PERMISSION` maps: `/admin`→DASHBOARD, `/admin/products`→PRODUCTS, `/admin/orders`→ORDERS, `/admin/coupons`→COUPONS, `/admin/reviews`→REVIEWS, `/admin/staff`→STAFF, `/admin/settings`→SETTINGS.
- `isAdminPathAllowed(role, pathname)` → true iff that exact path has a mapped permission and `hasPermission(role, permission)` is true; all other paths false.
- Unknown role or unknown permission must return `false` / safe fallback; never throw.

#### 2.6.2 Staff object (authoritative shape)

```js
{
  id: 7,
  email: 'staff2@sannha.vn',
  phoneNumber: '0905123456',
  fullName: 'Nguyễn Văn An',
  avatarUrl: 'https://...', // same style as existing users
  gender: 'MALE',
  dateOfBirth: '1995-06-15',
  role: 'STAFF',           // the staff page always fixes the role to 'STAFF'
  status: 'ACTIVE',        // 'ACTIVE' | 'LOCKED'
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLoginAt: '2025-06-01T00:00:00.000Z' | null
}
```

Back-office users = `ADMIN`, `STAFF`. The staff page lists and manages **only STAFF accounts**; ADMIN accounts are not listed, editable, or deletable there. Never persist password in the staff list or localStorage.

#### 2.6.3 StaffContext API

```js
const {
  staffMembers,     // STAFF accounts persisted under 'sport_staff' (with migration/merge described in Task B)
  addStaff,         // (data: StaffInput) => Promise<StaffUser>
  updateStaff,      // (id, data: Partial<StaffInput>) => Promise<StaffUser>
  setStaffStatus,   // (id, status) => Promise<StaffUser>
  removeStaff       // (id) => Promise<StaffUser> — hard delete, removes from the persisted list
} = useStaff();
```

`StaffInput` fields: `{ fullName, email, phoneNumber, role: 'STAFF', status: 'ACTIVE'|'LOCKED', password?: string }`. `password` is accepted on create only (initial password) and is never persisted in the staff list or localStorage.

#### 2.6.4 Cache key and cache entry shape

- Key string: **`${providerCode}|${addressId ?? ''}|${normalizeCity(city)}|${getSubtotalBucket(subTotal)}`**. Never include raw `subTotal`.
- `normalizeCity(city)` = `(city || '').trim().toLowerCase()`.
- `getSubtotalBucket(subTotal)`:
  - `subTotal <= 0` → `'0'`
  - `0 < subTotal < 500000` → `'lt_500k'`
  - `500000 <= subTotal < 1000000` → `'lt_1m'`
  - `>= 1000000` → `'gte_1m'`
- TTL cache internal entry: `{ value, expiresAt }`. `get(key)` returns `value` or `undefined` after expiry. `set(key, value, { ttlMs } = {})` overrides default TTL. `getOrLoad(key, loader, { ttlMs } = {})` de-duplicates in-flight promises: N concurrent calls for same key run `loader()` once; a rejected loader removes the in-flight entry and is **never cached**; success is cached with given/default TTL.
- Storage persistence: optional `storage` object, namespaced key, JSON parse/stringify wrapped in try/catch; corrupted JSON and quota/security errors are ignored. Guard `typeof window` / `sessionStorage`.

### 2.7 DECISIONS (recorded; do not re-open)

1. **MANAGER role removed.** The final role list is `CUSTOMER`, `STAFF`, `ADMIN` only. The backend `UserRole` enum already contains exactly these three values, so **no backend change is needed**.
2. **Statistics feature dropped.** Because the owner's final role list does not include a statistics-only role and the existing `/admin` Dashboard already covers KPIs, this prompt implements no `AdminStatisticsPage`, no `src/utils/statistics.js`, no statistics tests, permission, route, or nav item.

---

## 3. STEP-BY-STEP REQUIREMENTS

### 3.0 IMPLEMENTATION ORDER (dependency-ordered; never break the build between batches)

| Phase / Batch | Work | Verify gate before continuing |
|---|---|---|
| Batch 1 | Pure utils + their tests (§5): `pricing` constants, `formatters`, `permissions`, `staffRules`, `ttlCache`, `shippingCacheKey`, `shippingQuote`, `cartNumbering`. | `node --test tests/**/*.test.js` green; existing tests unchanged and green. |
| Batch 2 | Mocks, services, contexts, hooks: `users`, `authService`, `userService`, `shippingService`, `AuthContext`, `StaffContext`, `ChatbotContext`, `AddressContext`, `AppProviders`, `context/index`, `StoreContext`, `useShippingQuotes`. | Existing routes/pages still build; `npm run lint` 0/0; `npm test` green; `npm run build` green. |
| Batch 3 | Routes, layouts, pages, components: Task A UI, Task B UI, Task C CheckoutPage/CartPage, Task D chatbot components. | `npm run lint` 0/0; `npm test` green; `npm run build` green. |
| Batch 4 | `.env.example`, `README.md`; final QA. | Full checklist in §6.4; all commands green. |

Never move a file/feature into an earlier batch if it imports a not-yet-created module.

---

### TASK A — Sequential numbering (STT) in Cart and in the Place-Order item list

Goal: every product row shows a visible running number 1, 2, 3, … so customers can reference lines.

A1. **CartPage**: number items **continuously across all brand groups**, never restarting per brand. Compute one flat ordered list once with `useMemo` preserving the visual order produced by `groupedCart`; build `Map<itemKey, index+1>` via `buildLineNumberMap(groupedEntries)`. Pass the number to `CartItemRow`; render `<LineNumberBadge n={n} />` to the left of the checkbox/image (`w-6 h-6 rounded-full bg-surface-2 text-[11px] font-bold`). Must remain correct after remove/quantity change/select toggle. Add `aria-label={`Sản phẩm số ${n}`}` on the row or badge wrapper.
A2. **Responsive**: optional desktop caption "STT"; ensure no overflow at **320px**. No horizontal scrollbar from the badge.
A3. **CheckoutPage order summary** (the list shown when placing the order): prefix each row with the same `LineNumberBadge`, `n = array index + 1`. Keep `Đơn Hàng (N sản phẩm)` unchanged.
A4. **`lineNo` in payload**: read `src/services/orderService.js`. Only if `placeOrder` mapping whitelists orderItem fields, extend the whitelist to pass `lineNo: idx + 1`; otherwise **skip lineNo entirely and keep the payload unchanged**. Never change `cartItemIds`, `variantId`, `quantity`, or other existing semantics.
A5. **Shared component**: create `src/components/common/LineNumberBadge.jsx` (`export default function LineNumberBadge({ n })`), reuse it in `CartPage`, `CheckoutPage`, `OrderDetailPage.jsx`, and `AdminOrderModal.jsx`. All item lists render 1..N with identical style.

#### CRITICAL PITFALLS — Task A
- Do not compute numbering inside each brand group’s `items.map` — that resets per brand.
- Do not mutate cart items to store a number; `Map<itemKey, number>` is derived state and must rebuild from the current visually ordered groups.
- `LineNumberBadge` must be presentational and accept `n` only; no cart/context coupling.
- After removing item 1, numbering must renumber remaining items from 1. Do not persist the old number.
- For `lineNo`, verify the service whitelist before modifying; if uncertain, prefer skipping to avoid breaking orders.

#### ACCEPTANCE CRITERIA — Task A
1. Cart rows show a single continuous sequence 1..N across all brand groups; deleting any item renumbers correctly; brand group order remains unchanged.
2. Checkout summary rows show 1..N; sticky loading/error states don’t hide the badge.
3. `OrderDetailPage` and `AdminOrderModal` item lists use `LineNumberBadge`; all four usages have identical style.
4. `placeOrder` payload either includes valid `lineNo` or remains exactly as before (documented reason if skipped).
5. Mobile 320px has no overflow; aria-labels are correct Vietnamese strings.

---

### TASK B — STAFF/ADMIN role-based admin area + STAFF CRUD + coupon summary

Role semantics:
- `ADMIN`: everything STAFF has (Orders, Products, Reviews, Settings) **plus** Overview/Dashboard (`/admin`), Promotions/Coupons (`/admin/coupons`), and the new Staff Management page (`/admin/staff`). Default path after login = `/admin`.
- `STAFF`: the same admin area as today **except** Dashboard (`/admin`) and Coupons (`/admin/coupons`) are hidden and blocked. Keeps Products (`/admin/products`), Orders (`/admin/orders`), Reviews (`/admin/reviews`), Settings (`/admin/settings`). Default landing path = `/admin/orders`. Typing `/admin` or `/admin/coupons` as STAFF → one toast + redirect to `/admin/orders`, no redirect loop.
- `CUSTOMER`: storefront only, exactly as today. The only CUSTOMER-facing changes in this prompt are Task A numbering, Task C shipping cache (invisible except faster/instant UI), and Task D chatbot button. Customers still cannot access `/admin/*` (toast + redirect to `/` as today).
- Guest (not logged in): current behavior unchanged (§2.1); do not touch guest/client-route redirects or toasts.

B1. **Central permission model** — create `src/utils/permissions.js` exactly per §2.6.1. Pure functions, no React imports. Add a top-of-file comment block: backend `UserRole` already has `CUSTOMER, STAFF, ADMIN`, so **no backend change is needed**; these checks are UX-only; the server must enforce authorization.
B2. **AuthContext** — add `isStaff`, `isBackOffice` (ADMIN or STAFF), and memoized `can(permission)` (Boolean via `hasPermission` for the current user role; guest/unknown role → false). Keep existing fields backward compatible: `isAdmin` is **ADMIN only** and must remain **`user.role === 'ADMIN'` only**, not back-office. Sanitize persisted `sport_user`: an old/unknown/missing role is treated as having **no permissions** and must never crash; default missing `status` to `'ACTIVE'`.
B3. **Mock data/services** — update `src/mocks/users.js`:
   - Keep the current 4 CUSTOMERs, existing STAFF (id 5), and ADMIN (id 6) exactly.
   - Add two more STAFF users: id 7 (`staff2@sannha.vn`, status `ACTIVE`) and id 8 (`staff3@sannha.vn`, status `LOCKED`). No MANAGER user.
   - Add `createdAt` and `lastLoginAt` for back-office users (ids 5, 6, 7, 8); do not break existing customer objects.
   Update `authService` mock login so: `admin@…` logs in as ADMIN; `staff@…` (any STAFF mock email) logs in as STAFF; any other email falls back to CUSTOMER; a **LOCKED** back-office user is rejected with a Vietnamese error (e.g. `'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'`).
   Keep `userService.getCustomers()` returning CUSTOMER only. Add:
   ```js
   getStaffMembers() {}
   createStaff(data) {}
   updateStaff(id, data) {}
   setStaffStatus(id, status) {}
   deleteStaff(id) {} // removes the record from the persisted staff list
   ```
   Use the existing `USE_MOCK` pattern (`import.meta.env.VITE_USE_MOCK !== 'false'`) and same try/axios style as existing services.
B4. **Routing** (`AppRoutes.jsx`) — replace `AdminRoute` with `RoleRoute({ permission, children })` for admin paths only:
   - not logged in → keep today's exact admin-route behavior: `<Navigate to="/login?redirect=/admin" replace />`; **do not change guest redirects/toasts for client routes** (`/checkout`, `/wishlist`, `/account/*` stay exactly as today);
   - CUSTOMER → toast `'Tài khoản khách hàng không có quyền truy cập trang quản trị!'` + `<Navigate to="/" replace />`;
   - back-office without the permission (e.g. STAFF on `/admin` or `/admin/coupons`) → toast `'Bạn không có quyền truy cập chức năng này'` + redirect to `getDefaultAdminPath(role)` (ADMIN → `/admin`, STAFF → `/admin/orders`); if that fallback path is itself forbidden, redirect to `/`. **No redirect loop**.
   - **Never call `showToast` during render**; use a small `ForbiddenRedirect` component that calls toast once in `useEffect` before returning `<Navigate>`.
   - Wrap routes exactly: `/admin` DASHBOARD, `/admin/products` PRODUCTS, `/admin/orders` ORDERS, `/admin/coupons` COUPONS, `/admin/reviews` REVIEWS, `/admin/staff` STAFF, `/admin/settings` SETTINGS. Add the lazy route `/admin/staff` inside `<Suspense>`. Do not add `/admin/statistics`.
B5. **AdminLayout** — convert `ADMIN_NAV_ITEMS` to items carrying `permission`; filter by `can(item.permission)`. Sidebar nav by role: ADMIN sees Dashboard, Products, Orders, Coupons, Reviews, Staff, Settings; STAFF sees Products, Orders, Reviews, Settings only. Add "Quản Lý Nhân Viên" (`Users`). Preserve existing labels/icons/badges (`orders`, `reviews` PENDING badges). Show the current user role label from `ROLE_LABELS_VI` in the profile area. Login redirect after authentication: back-office users go to `getDefaultAdminPath(role)` (ADMIN → `/admin`, STAFF → `/admin/orders`); honour `?redirect=` **only if** `isAdminPathAllowed(role, redirectPath)` — so STAFF never lands on `/admin` even when the redirect param says so; CUSTOMER keeps today's post-login behavior.
B6. **`src/pages/admin/AdminStaffPage.jsx`** (route permission `STAFF`, ADMIN-only) — full CRUD on STAFF accounts:
   - Table of **STAFF-only** accounts: avatar, name, email, phone, fixed role label ("Nhân viên"), status badge, `createdAt`/`lastLoginAt` formatted `DD/MM/YYYY HH:mm`; search (diacritic-insensitive: `String.prototype.normalize('NFD')` + remove diacritics), status filter (`ACTIVE`/`LOCKED`), client-side pagination reusing the existing `Pagination` component. ADMIN accounts never appear in this page, even if present in persisted data.
   - Create/edit modal `src/components/common/AdminStaffModal.jsx` in the same visual style as `AdminCouponModal.jsx`. Create fields: `fullName`, `email`, `phoneNumber`, `status`, initial `password` with policy: ≥ 8 chars, at least one letter and one digit; `role` is **fixed to STAFF and shown read-only** (no select). Edit modal: same editable fields minus password; password is **not editable** here.
   - Delete: confirm dialog; removing a staff member **removes the record from the persisted list** via `StaffContext`. Lock/unlock toggle switches `status` between `ACTIVE`/`LOCKED` via `setStaffStatus`.
   - Guards via `staffRules` (§2.6.2): `canManageStaff(actor,target)` true only for ADMIN acting on STAFF; `canAssignRole(actor, role)` true only for ADMIN assigning STAFF. Validation: email format + case-insensitive uniqueness, VN phone `^(0|\+84)\d{9}$`, status must be `ACTIVE`/`LOCKED`, role must be `STAFF`. Invalid actions show clear Vietnamese errors.
   - Persist through `StaffContext` (seeded from the mock STAFF users ids 5, 7, 8; merge missing mock users into any existing persisted `sport_staff` array by id so a stale localStorage key does not hide the new STAFF mocks). Register in `AppProviders.jsx`; re-export from `context/index.js` and `StoreContext` facade `useStore()`.
   - Toasts via `useUI().showToast`. Focus management and `Esc` close in modal.
B7. **Coupons for ADMIN** — ensure `/admin/coupons` CRUD/toggle/delete works for ADMIN. Keep the summary strip in `AdminCouponsPage`: active / expired / upcoming counts computed from `startDate`/`endDate`/`isActive` with current date; use `useMemo`, no extra state. The page and route `/admin/coupons` are ADMIN-only; STAFF direct access is blocked by `RoleRoute` (toast + redirect `/admin/orders`).
B8. **Backend note** — documented comment at top of `permissions.js` per B1 confirms `UserRole = CUSTOMER, STAFF, ADMIN` already matches; **no backend change is needed**. Do **not** edit `backend/` or `documents/`.

#### CRITICAL PITFALLS — Task B
- **React 19 + react-hooks v7**: no `setState`/toast in render, no ref access in render. Route guards must toast/redirect from a mounted child or effect.
- **Redirect loops**: STAFF on `/admin` or `/admin/coupons` must land on `/admin/orders` exactly once; always check the permission of `getDefaultAdminPath(role)` before navigating; fall back to `/` if needed.
- **Guest logic**: do not alter guest redirects/toasts for `/checkout`, `/wishlist`, `/account/*`; only the admin guard is replaced.
- **Persisted localStorage user**: existing `sport_user` may contain an old/unknown role or missing fields. Sanitize in `AuthProvider` (default `status: 'ACTIVE'`, unknown role → no permissions, never crash); never assume new fields exist.
- **`isAdmin`** must not accidentally become true for STAFF; it is strictly `role === 'ADMIN'` only.
- **StaffContext stale persistence**: merge newly added mock STAFF users into any existing persisted `sport_staff` array by id; do not simply overwrite or ignore.
- **Permissions**: enforce in both UI and page logic, not only by hiding nav. Direct URL access must be blocked by `RoleRoute`.
- **Staff page scope**: list/manage STAFF accounts only; ADMIN accounts are never editable/deletable here; role is fixed to STAFF and cannot be assigned otherwise.
- **Locked staff**: a LOCKED STAFF must be blocked by the mock `authService` with a Vietnamese error; do not allow login through other mock paths.
- **Modal effects**: close/focus/Esc handlers must have stable callbacks and cleanup; avoid stale closures on the record being edited.
- **Constants**: use `FREE_SHIPPING_THRESHOLD_*` in pricing logic; do not reintroduce magic numbers.

#### ACCEPTANCE CRITERIA — Task B
1. Permission matrix tests pass; `hasPermission` returns false for unknown inputs without throwing.
2. Login as `admin@sannha.vn` lands on `/admin`; side nav shows Dashboard, Products, Orders, Coupons, Reviews, Staff, Settings; Profile shows "Quản trị viên".
3. Login as `staff@sannha.vn` lands on `/admin/orders` (never `/admin`); side nav shows Products, Orders, Reviews, Settings only — no Dashboard/Coupons/Staff; Profile shows "Nhân viên".
4. STAFF typing `/admin` or `/admin/coupons` → one toast `'Bạn không có quyền truy cập chức năng này'` + redirect to `/admin/orders`, no loop. CUSTOMER → any `/admin/*` → toast + redirect `/` with no loop. Guest flows for `/checkout`, `/wishlist`, `/account/*` are unchanged.
5. ADMIN can create/edit/lock/delete STAFF on `/admin/staff`; only STAFF accounts are listed; ADMIN accounts never appear; invalid inputs/actions show clear Vietnamese errors.
6. Staff search handles `Nha`, `nhã`, `NHA` equivalently; status filter, pagination, and status badges work.
7. A LOCKED STAFF is blocked at login with a Vietnamese error from the mock `authService`.
8. Coupons page summary counts active/expired/upcoming correctly; ADMIN has full CRUD; STAFF direct access to `/admin/coupons` is blocked.
9. Existing persisted users with old/missing/unknown fields still render and authenticate without errors.

---

### TASK C — Cache shipping fee & estimated delivery date

Goal: stop recalculating on every render/selection; one network call per unique (provider, destination, subtotal-bucket) within TTL; instant UI on provider switching.

C1. **`src/utils/ttlCache.js`** — implement exactly per §2.6.4. Pure JS, no React, runs in plain Node (guard `window`/`sessionStorage`). LRU eviction at `maxEntries`; expiry by `now()`; safe JSON persistence; in-flight de-duplication.
C2. **`shippingService`**:
   - `getShippingProviders()` cached TTL 1 hour under key `'providers'`; use only active providers.
   - `calculateShipping({ providerCode, addressId, city, subTotal })` uses the cache with key from `buildShippingCacheKey`. Use `getSubtotalBucket`; never put raw `subTotal` in the key.
   - Always return **normalized quote** via `normalizeShippingQuote`: `{ shippingFee: number, estimatedDeliveryDate: string|null, formattedDeliveryDate: string, source: 'api'|'fallback' }`.
   - Fallback must produce `formattedDeliveryDate` with `formatEstimatedDelivery` (`Intl.DateTimeFormat('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric', timeZone:'Asia/Ho_Chi_Minh' })`); fallback fee = `0` when `subTotal >= FREE_SHIPPING_THRESHOLD_1M`, otherwise `30000`; fallback ETA = now + 3 days ISO.
   - Fallback results cached with **30-second TTL** so the real API is retried soon; API results cached with **10-minute TTL** (use `set(key, value, { ttlMs })`).
   - Add `invalidateShippingCache()` that clears the shipping cache; call it from `AddressContext` on add/edit/delete/set default and on logout.
   - Keep only GHN/GHTK and keep `DEFAULT_SHIPPING_PROVIDERS` export.
C3. **`CheckoutPage` refactor** (keep visual design):
   - Implement `useShippingQuotes({ addressId, city, subTotal })` per §2.6. It fetches providers once (cached), then quotes in parallel **only for cache misses**, with request-id/AbortController-style guard against out-of-order responses, ~250 ms debounce on rapid changes, and `refresh()` that invalidates current keys and refetches.
   - Derive `shippingFee` / `estimatedDeliveryDate` with `useMemo` from `quotes[selectedProviderCode]`; **remove mirrored `shippingFee`/`estimatedDeliveryDate` state** and the `setShippingFee` in the provider card `onClick`. Provider selection must be instant, no network.
   - `isInitializing` must become false on success, error, and abort. Skeleton/placeholder must not shift layout.
   - Show a small `"Cập nhật lúc HH:mm"` or `"(ước tính)"` hint when `source === 'fallback'`.
   - Before `handlePlaceOrder` sends, assert the submitted `shippingFee` equals the displayed quote for the selected provider.
C4. **Pre-warm optional**: from `CartPage`, if user has a default address, fire-and-forget `calculateShipping` for default provider; swallow/log errors only (do not toast).

#### CRITICAL PITFALLS — Task C
- **Cache key mistake**: raw `subTotal` in key means cache never hits. Use bucket constants only.
- **Stale closures**: never read `selectedProviderId` inside the shipping effect; derive display values after selection. Remove mirrored state.
- **Out-of-order responses**: a slower previous request must not overwrite a newer one. Use abort/request-id guard.
- **Rejected/cancelled loaders**: never cache failures; clear in-flight entry so next call retries.
- **Loading stuck**: `isLoading` must become false in `finally`/catch/abort paths.
- **Fallback formatting**: API error paths must still produce `formattedDeliveryDate`; otherwise ETA renders blank.
- **SessionStorage**: guard availability and parse errors; private mode/quota errors must not crash checkout.
- **Hooks**: debounce/setState must occur inside `useEffect` with cleanup; no setState during render; no ref reads in render.
- **Invalidation**: address change or logout must not reuse stale quotes for a different destination.

#### ACCEPTANCE CRITERIA — Task C
1. `ttlCache` tests pass: TTL expiry, LRU eviction, in-flight dedupe, rejected loader not cached, corrupt storage ignored.
2. `shippingCache` tests pass: same bucket produces same key; different provider/city/address produce different keys; fallback quote has `formattedDeliveryDate` + `source:'fallback'`; only GHN/GHTK.
3. Checkout makes provider call + at most one quote call per provider per bucket; provider switching triggers no new network calls and updates fee/date immediately.
4. Revisiting checkout within 10 minutes reuses cached API quotes; fallback retries after 30 seconds.
5. Rapid address/subtotal changes settle on the latest quote; no stale overwrite; loading state ends in all cases.
6. Existing tests pass unchanged; pricing constants reused; no magic `500000`/`1000000` values outside `pricing.js`.

---

### TASK D — Floating chatbot launcher (bottom-right) with integration slot

Build only the launcher + clean integration contract. The real chatbot is integrated later.

D1. **`src/components/chatbot/ChatbotLauncher.jsx`** — fixed circular button bottom-right (`fixed right-4 bottom-4 sm:right-6 sm:bottom-6`, ≈48–56 px, `bg-accent text-white shadow-lg`, `lucide-react` `MessageCircle` ↔ `X` swap), subtle hover/active animation, optional unread dot prop. Accessible: `<button type="button" aria-label="Mở trợ lý ảo" aria-expanded aria-controls="chatbot-panel">`, visible keyboard focus ring, `Esc` closes panel. Respect `prefers-reduced-motion`. Use `z-40`; inspect `UIContext` toast stack and modal z-index, offset if needed so the launcher never covers toasts/modals.
D2. **`src/components/chatbot/ChatbotPanel.jsx`** — panel above button: `w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-7rem))]`, rounded, `border-line`, `bg-surface`, Vietnamese title `'Trợ lý Sân Nhà Sport'`, close button, and body slot priority:
   1. React node from `ChatbotProvider`’s `renderPanel` prop;
   2. `<iframe>` when `import.meta.env.VITE_CHATBOT_URL` is set — `title`, `sandbox="allow-scripts allow-forms allow-same-origin allow-popups"`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`;
   3. placeholder `'Chưa kết nối chatbot'` with short integration instructions visible only in `import.meta.env.DEV`.
   Lazy-mount the body only after first open; keep mounted afterward to preserve conversation state.
D3. **`src/context/ChatbotContext.jsx`** — API exactly per §2.6: `{ isOpen, open, close, toggle, unreadCount, setUnreadCount }`. Dispatch/listen to window custom events `chatbot:open`, `chatbot:close`, `chatbot:toggle` so non-React code can control it. Document integration contract in a JSDoc block at top: `VITE_CHATBOT_URL` (add to `.env.example`, never to `.env`), `renderPanel`, events, and `postMessage` origin allow-list recommendation.
D4. **Mount only in `ClientLayout`** (storefront). Hide on `/checkout` and `/payment-result` on small screens only if it would cover primary CTA (`useLocation` + conditional `hidden sm:block` class); never render in admin layouts. Register `ChatbotProvider` locally in `ClientLayout` and add one comment justifying the lighter local choice.
D5. **Iframe `postMessage`** — if `VITE_CHATBOT_URL` is set, accept only `{ type: 'chatbot:unread', count }` from `event.origin === new URL(VITE_CHATBOT_URL).origin`; validate count is a non-negative integer; ignore everything else. Update `unreadCount`.

#### CRITICAL PITFALLS — Task D
- **iframe security**: validate `event.origin` against `new URL(iframeUrl).origin`, never allow `"*"` for postMessage handling; do not forward secrets/tokens to the iframe.
- **z-index collisions**: toasts/modals must remain above the chatbot; inspect `UIContext` and modal layers, choose `z-40` or lower than modals, and offset from toast stack.
- **Lazy iframe**: do not load iframe source before first open; keep panel body mounted after first open to preserve chatbot state.
- **Effect cleanup**: remove window/custom-event listeners, `Esc` listeners, and timers; avoid stale `isOpen` closures (use functional updates or refs).
- **Mobile 320px**: panel and launcher must fit; no overflow; hidden on small checkout screens.
- **Render purity**: `setUnreadCount` from postMessage/event listeners must happen in effects only, never in render.

#### ACCEPTANCE CRITERIA — Task D
1. Launcher appears only on storefront layouts, fixed bottom-right, accessible label/expanded/controls, `Esc` toggles close, unread dot updates.
2. Panel opens with Vietnamese title; iframe loads only after first open and remains mounted thereafter.
3. `postMessage` unread count updates only for matching origin and valid count; other messages and origins ignored.
4. `renderPanel` prop takes precedence over iframe; no `VITE_CHATBOT_URL` shows dev placeholder only in dev.
5. No collision with toasts/modals; mobile 320px and checkout/payment-result small screens behave qualitatively.

---

## 4. STRICT CONSTRAINTS

1. Do not touch `backend/`, `documents/`, `.env`, `_progress/`. Never print secrets or real env values.
2. No new npm dependencies (charts, cache, i18n, etc. must be hand-written). If a dependency seems unavoidable, stop and explain instead of adding it.
3. Backward compatible: existing exports (`useAuth().isAdmin`, `useStore()` keys, `shippingService.calculateShipping` signature, existing utility function names) keep working. Existing tests in `tests/` (pricing, formatters, address, reviews, coupons, shipping) must pass **unchanged**; extend only where a new assertion legitimately needs a new constant without weakening existing assertions.
4. Only GHN and GHTK carriers; no other carrier in code, mocks, copy, or tests.
5. React 19 + `eslint-plugin-react-hooks` v7: no side effects in render, no setState in render, no ref access in render, stable effect/useMemo/useCallback deps, no cascading setState loops. Target `npm run lint` **0 errors / 0 warnings** and `npm run build` green.
6. Production-grade: loading/empty/error states; null-safe field access; Vietnamese Unicode search normalization; a11y (labels, roles, modal focus management, `Esc`); dark mode via existing tokens; mobile-first down to 320px.
7. No `// TODO`, no placeholder returns, no pseudo-code. Mock data only behind existing `USE_MOCK` pattern.
8. Keep files focused (< ~400 lines where practical); split logic into `utils/` and `hooks/`.
9. All code/comments/identifiers in English; user-visible strings in Vietnamese.

---

## 5. TESTS TO WRITE (Node 22 native, files in `tests/`, ESM, no DOM)

Run: `node --test tests/**/*.test.js`. Do **not** weaken existing tests; existing files must remain unchanged unless a spec here requires a purely additive assertion.

1. `tests/permissions.test.js`
   - imports: `{ ROLES, ADMIN_PERMISSIONS, ROLE_PERMISSIONS, hasPermission, isBackOfficeRole, getDefaultAdminPath, isAdminPathAllowed }` from `../src/utils/permissions.js`.
   - Assert the full matrix table in §2.6.1; `isBackOfficeRole` true only for ADMIN/STAFF; default paths (ADMIN → `/admin`, STAFF → `/admin/orders`); unknown role/permission → false/safe; `isAdminPathAllowed` exact path matches only.
2. `tests/ttlCache.test.js`
   - imports: `{ createTtlCache }` from `../src/utils/ttlCache.js`.
   - Assert hit/miss; TTL expiry with injected `now`; LRU eviction at `maxEntries`; in-flight de-dup exactly one loader call for N concurrent `getOrLoad`; rejected loader not cached and clears in-flight; fake storage persistence round-trip; corrupted storage JSON ignored; `set` TTL override.
3. `tests/shippingCache.test.js`
   - imports: `{ normalizeCity, getSubtotalBucket, buildShippingCacheKey, SHIPPING_CACHE_TTL_MS, FALLBACK_SHIPPING_TTL_MS, PROVIDERS_CACHE_TTL_MS }` from `../src/utils/shippingCacheKey.js`; `{ normalizeShippingQuote }` from `../src/utils/shippingQuote.js`; `{ formatEstimatedDelivery }` from `../src/utils/formatters.js`.
   - Assert bucket boundaries; same bucket/provider/city/address produce identical key; different provider/city/address produce different keys; raw `subTotal` never appears; fallback normalized quote always contains `shippingFee`, ISO/null `estimatedDeliveryDate`, non-empty `formattedDeliveryDate`, `source:'fallback'`; only GHN/GHTK code strings are used.
4. `tests/staff.test.js`
   - imports `{ canManageStaff, canAssignRole, validateStaffInput }` from `../src/utils/staffRules.js`.
   - Assert `canManageStaff` true **only** for ADMIN acting on STAFF; false for ADMIN→ADMIN, STAFF→STAFF, STAFF→ADMIN, CUSTOMER→STAFF, and self-targets; `canAssignRole` true **only** for ADMIN assigning `STAFF`, false for STAFF/CUSTOMER actors and for assigning ADMIN; email format + case-insensitive uniqueness; VN phone regex `^(0|\+84)\d{9}$`; password policy (≥8 chars, letter + digit) when provided; invalid role/status rejected.
5. `tests/lineNumber.test.js`
   - imports `{ buildLineNumberMap }` from `../src/utils/cartNumbering.js`.
   - Assert continuous numbering across multiple groups; stability under reorder/removal (by constructing new group arrays); empty input returns empty Map; duplicate/missing keys handled safely (first occurrence wins or skip undefined).

Each test file must pass under `node --test`. Use only plain ESM imports; no DOM.

---

## 6. OUTPUT FORMAT

You must deliver in **four separate responses**. Do **not** dump all files at once.

### 6.1 Batch sequence

**First response — Batch 1:**
1. Short **plan** (≤15 lines) and **risks/assumptions** (5–10 bullets).
2. All Batch 1 files (complete).
3. End exactly with: `### END BATCH 1 — reply CONTINUE for Batch 2`.
4. Before ending Batch 1, run `node --test tests/**/*.test.js`; fix and re-run if not green.

**After user sends `CONTINUE` — Batch 2:** output all Batch 2 files; end with `### END BATCH 2 — reply CONTINUE for Batch 3`. Run lint/test/build before ending.

**After user sends `CONTINUE` — Batch 3:** output all Batch 3 files; end with `### END BATCH 3 — reply CONTINUE for Batch 4`. Run lint/test/build before ending.

**After user sends `CONTINUE` — Batch 4:** output `.env.example` + full `README.md`; run full verification in §6.4; then end with `### END BATCH 4 — ALL TASKS COMPLETE`.

### 6.2 File output format

For every created or modified file output:

```
### FILE: relative/path/from/frontend/root.ext   (NEW | MODIFIED)
```jsx
<ENTIRE file content — 100% complete; for MODIFIED files output the whole file, not a diff>
```
```

No ellipses, no `// TODO`, no partial files inside a batch.

### 6.3 Expected files by batch

**Batch 1 — utils + tests:**
- `src/utils/pricing.js` (MODIFIED — add two constants only)
- `src/utils/formatters.js` (MODIFIED — add `formatEstimatedDelivery`)
- `src/utils/permissions.js` (NEW)
- `src/utils/staffRules.js` (NEW)
- `src/utils/ttlCache.js` (NEW)
- `src/utils/shippingCacheKey.js` (NEW)
- `src/utils/shippingQuote.js` (NEW)
- `src/utils/cartNumbering.js` (NEW)
- `tests/permissions.test.js` (NEW)
- `tests/staff.test.js` (NEW)
- `tests/ttlCache.test.js` (NEW)
- `tests/shippingCache.test.js` (NEW)
- `tests/lineNumber.test.js` (NEW)

**Batch 2 — contexts/services/hooks:**
- `src/mocks/users.js` (MODIFIED)
- `src/services/authService.js` (MODIFIED)
- `src/services/userService.js` (MODIFIED)
- `src/services/shippingService.js` (MODIFIED)
- `src/context/AuthContext.jsx` (MODIFIED)
- `src/context/AddressContext.jsx` (MODIFIED)
- `src/context/StaffContext.jsx` (NEW)
- `src/context/ChatbotContext.jsx` (NEW)
- `src/context/AppProviders.jsx` (MODIFIED)
- `src/context/index.js` (MODIFIED)
- `src/context/StoreContext.jsx` (MODIFIED)
- `src/hooks/useShippingQuotes.js` (NEW)

**Batch 3 — routes/layouts/pages/components:**
- `src/components/common/LineNumberBadge.jsx` (NEW)
- `src/components/common/AdminStaffModal.jsx` (NEW)
- `src/components/common/AdminOrderModal.jsx` (MODIFIED — item numbering)
- `src/routes/AppRoutes.jsx` (MODIFIED)
- `src/layouts/AdminLayout.jsx` (MODIFIED)
- `src/layouts/ClientLayout.jsx` (MODIFIED)
- `src/pages/auth/LoginPage.jsx` (MODIFIED — redirect rules)
- `src/pages/admin/AdminStaffPage.jsx` (NEW)
- `src/pages/admin/AdminCouponsPage.jsx` (MODIFIED — summary strip)
- `src/pages/client/CartPage.jsx` (MODIFIED — numbering + prewarm)
- `src/pages/client/CheckoutPage.jsx` (MODIFIED — shipping hook + numbering)
- `src/pages/client/OrderDetailPage.jsx` (MODIFIED — item numbering)
- `src/components/chatbot/ChatbotLauncher.jsx` (NEW)
- `src/components/chatbot/ChatbotPanel.jsx` (NEW)

**Batch 4 — docs/env:**
- `.env.example` (MODIFIED — add `VITE_CHATBOT_URL` placeholder, no real secrets)
- `README.md` (MODIFIED — output full file, add "Tích hợp Chatbot" section: env var, `renderPanel`, events API, `postMessage` origin allow-list recommendation)

### 6.4 Final SELF-REVIEW CHECKLIST (run before ending Batch 4; fix failures first)

Tick each before final output:
- `node --test tests/**/*.test.js` green, including **all pre-existing tests unchanged**.
- `npm run lint` = **0 errors, 0 warnings**.
- `npm run build` succeeds.
- All output files are complete, no diffs, no ellipses, no `// TODO`, no pseudo-code.
- No new npm dependency; no changes under `backend/`, `documents/`, `.env`, `_progress/`; no secret printed.
- Only GHN/GHTK carriers appear anywhere.
- `hasPermission` matrix matches §2.6.1 exactly; no MANAGER, no STATISTICS, no read-only permission logic remains.
- `isAdmin` is strictly `ADMIN`; STAFF/ADMIN/CUSTOMER/guesT behavior matches the role semantics; persisted user with old/unknown role cannot crash.
- Guest flows for `/checkout`, `/wishlist`, `/account/*` are unchanged (redirect to `/login` with redirect param and existing toasts).
- STAFF direct URL to `/admin` or `/admin/coupons` → one toast `'Bạn không có quyền truy cập chức năng này'` + redirect `/admin/orders`, no loop; STAFF login always lands on `/admin/orders`; ADMIN login lands on `/admin`; `?redirect=` honoured only when permitted for the role.
- Route guard has no render-phase toast/setState; fallback path checked.
- Staff page lists/manages STAFF accounts only; ADMIN accounts never appear; LOCKED staff blocked at login; create/edit/delete/lock validation follows `staffRules`.
- Shipping cache key uses bucket, never raw `subTotal`; fallback quote always has `formattedDeliveryDate`; fallback TTL 30s and API TTL 10m; invalidated on address/logout.
- Checkout no longer mirrors `shippingFee`/`estimatedDeliveryDate` in state; provider switch is instant.
- Cart numbering is continuous across brand groups and renumbers after removal.
- Chatbot launcher z-index does not cover toasts/modals; iframe loads only after first open; postMessage validates exact origin and count.
- No statistics artifacts remain (no page, util, test, permission, route, or nav item); the DECISIONS note in §2.7 records the drop.
- Mobile 320px verified in code for new UI; dark-mode tokens used; all user-facing strings Vietnamese.

### 6.5 Manual QA script (minimum; include in final Batch 4 response as a checklist)

1. Guest (not logged in): storefront + cart work as today; `/checkout`, `/wishlist`, `/account/*` still redirect to `/login` with the `redirect` param and existing toasts; guest `/admin/*` still redirects to `/login?redirect=/admin` as today.
2. Login `admin@sannha.vn` → lands on `/admin`; Dashboard visible; nav shows Dashboard, Products, Orders, Coupons, Reviews, Staff, Settings; profile shows "Quản trị viên".
3. Login `staff@sannha.vn` → redirected to `/admin/orders`; nav shows Products, Orders, Reviews, Settings only; no Dashboard/Coupons/Staff; profile shows "Nhân viên".
4. STAFF types `/admin` directly → one toast `Bạn không có quyền truy cập chức năng này` + redirect `/admin/orders`; STAFF types `/admin/coupons` directly → same toast + redirect `/admin/orders`; no redirect loop.
5. Customer visits `/admin/orders` or `/admin/staff` directly → one toast `Tài khoản khách hàng không có quyền truy cập trang quản trị!` + redirect `/`; no loop.
6. Admin opens `/admin/staff`: list shows only STAFF accounts (ids 5, 7, 8 incl. the LOCKED one); Create modal shows role "Nhân viên" read-only; invalid VN phone or weak password → inline Vietnamese validation; valid create → row appears and persists after reload.
7. Admin edits a STAFF account → edit modal has no password editing; changes persist. Delete asks for confirmation and removes the row from the persisted list; lock/unlock toggles status between ACTIVE/LOCKED.
8. The LOCKED STAFF tries to log in → mock `authService` returns a Vietnamese account-locked error and login is blocked.
9. Admin searches `nha` / `Nhã` / `NHA` on the staff page → same diacritic-insensitive results; status filter and existing Pagination work.
10. Coupons page shows active/expired/upcoming counts; Admin toggles/creates/deletes coupon; STAFF cannot open `/admin/coupons` (blocked per step 4).
11. Cart with two brand groups shows 1..N continuous; remove first item → renumbering starts at 1; mobile 320px no overflow.
12. Checkout: switch GHN/GHTK → fee/ETA change instantly; network tab shows no new quote calls on provider switch; revisit checkout → cached quote; break API → fallback shows non-empty ETA + "(ước tính)".
13. Address change then checkout → new destination quotes fetched; logout/login → no stale shipping quote.
14. Storefront chatbot: button fixed bottom-right; opens panel "Trợ lý Sân Nhà Sport"; Esc closes; unread dot from matching-origin postMessage updates; mobile 320px fits; checkout small screen hides launcher.

---

**Finish ALL four tasks completely. Do not stop early, do not summarize code instead of writing it, do not omit files. Stop after each batch and wait for `CONTINUE`.**