# TailorEase — SYSTEM CONTEXT DOCUMENTATION

> **Purpose:** This is the single source of truth for the entire TailorEase system.
> Every AI agent, developer, or contributor MUST read this file before modifying the system.
> When changes are made, the agent MUST update the relevant sections of this file.
>
> **Last updated:** 2026-11-02
> **System version:** Latest (Laravel 13 + React 19 + Inertia 3)

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Architecture](#4-database-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Order Lifecycle & Status Flow](#8-order-lifecycle--status-flow)
9. [The Designer System (2D/3D)](#9-the-designer-system-2d3d)
10. [Routing & Navigation](#10-routing--navigation)
11. [Data Flow: Request → Response](#11-data-flow-request--response)
12. [Shared Props & State Management](#12-shared-props--state-management)
13. [API Contracts: Inertia Shared Data](#13-api-contracts-inertia-shared-data)
14. [Key Business Logic](#14-key-business-logic)
15. [File Storage & Media](#15-file-storage--media)
16. [Build System & Dev Workflow](#16-build-system--dev-workflow)
17. [Testing & Quality](#17-testing--quality)
18. [Known Issues & Quirks](#18-known-issues--quirks)
19. [Future Extension Points](#19-future-extension-points)

---

## 1. SYSTEM OVERVIEW

**TailorEase** is a custom apparel/tailoring order management system (SaaS-style, single-tenant) built with Laravel 13 (backend) + React 19 + Inertia.js 3 (frontend SPA).

### Core Purpose
- Customers browse apparel catalog, place bulk orders with size breakdowns, upload design files, and track production.
- Tailors review incoming orders, accept/reject, advance order status through a production pipeline, export orders to CSV, and manage the catalog.
- An integrated **visual designer** (Studio Pro) allows creating apparel designs on a 2D Konva canvas with live 3D Three.js shirt preview, image filters, templates, and export.

### User Roles
| Role | Description |
|------|-------------|
| `customer` | Default role. Can browse catalog, place orders, track orders, make payments (mocked), use designer. |
| `tailor` | Staff role. Can accept/reject orders, advance status, view all orders, export CSV, manage catalog. |

> **NOTE:** Role is a non-standard attribute on the `users` table — it is NOT part of the default Laravel Fortify user model. It is accessed via `$user->getAttribute('role')`. There is currently no UI to assign roles — roles are set directly in the database or via seeder.

---

## 2. TECH STACK

### Backend
| Component | Version | Purpose |
|-----------|---------|---------|
| PHP | 8.3+ | Language |
| Laravel | 13.7 | Framework |
| Laravel Fortify | 1.37.2 | Authentication (login, register, 2FA, passkeys) |
| Inertia.js Laravel | 3.0 | Server-side SPA adapter |
| Laravel Wayfinder | 0.1.14 | Type-safe route generation for frontend |
| Laravel Chisel | 0.1.0 | Blade component helpers |
| Laravel Passkeys | 0.2.0 | WebAuthn passkey support |
| MongoDB | 8 | Database, sessions, cache, and queues. Local server runs in Docker. |
| Pest | 4.7 | Testing framework |
| Larastan | 3.9 | PHP static analysis |
| Laravel Pint | 1.27 | Code style fixer |

### Frontend
| Component | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.7 | Language |
| Inertia.js React | 3.0 | Client-side SPA adapter |
| Vite | 8.0 | Build tool |
| Tailwind CSS | 4.0 | Styling (with `@tailwindcss/vite` plugin) |
| React Konva | 19.2 | 2D canvas rendering (designer) |
| Three.js / React Three Fiber / Drei | 0.184 / 9.6 / 10.7 | 3D shirt viewer |
| React Spring Three | 10.1 | 3D animations |
| Radix UI | various | Accessible UI primitives (dialog, select, dropdown, checkbox, etc.) |
| Lucide React | 0.475 | Icon library |
| Recharts | 3.8 | Charts (reports) |
| Sonner | 2.0 | Toast notifications |
| clsx + tailwind-merge + CVA | — | Class name utility |
| Prettier | 3.4 | Code formatter |
| ESLint | 9.17 | Linter |

---

## 3. PROJECT STRUCTURE

```
tailorease/
├── app/
│   ├── Actions/Fortify/         # Fortify action classes (CreateNewUser, ResetUserPassword)
│   ├── Concerns/                # (empty or traits)
│   ├── Console/                 # Artisan commands
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php           # Abstract base controller
│   │   │   ├── OrderController.php      # Customer order CRUD + dashboard
│   │   │   ├── TailorOrderController.php # Tailor-only order management
│   │   │   └── Settings/
│   │   │       ├── ProfileController.php
│   │   │       └── SecurityController.php
│   │   ├── Middleware/
│   │   │   ├── HandleAppearance.php     # Shares `appearance` cookie with views
│   │   │   └── HandleInertiaRequests.php # Inertia shared props (auth, sidebarOpen)
│   │   └── Requests/
│   │       ├── StoreOrderRequest.php    # Validation for order create/update
│   │       └── Settings/
│   │           ├── ProfileDeleteRequest.php
│   │           ├── ProfileUpdateRequest.php
│   │           ├── PasswordUpdateRequest.php
│   │           └── TwoFactorAuthenticationRequest.php
│   ├── Models/
│   │   ├── User.php             # MongoDB user, PasskeyUser, HasMany orders
│   │   ├── Order.php            # Order document
│   │   ├── Product.php          # Catalog document
│   │   └── Passkey.php          # WebAuthn passkey document
│   └── Providers/               # Service providers
├── bootstrap/                   # App bootstrap
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── fortify.php              # Fortify feature flags
│   ├── inertia.php
│   └── ...
├── database/
│   ├── factories/               # Model factories
│   ├── migrations/              # MongoDB collection and index migrations
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 0001_01_01_000001_create_cache_table.php
│   │   ├── 0001_01_01_000002_create_jobs_table.php
│   │   ├── 2024_01_01_000000_create_passkeys_table.php
│   │   ├── 2025_08_14_170933_add_two_factor_columns_to_users_table.php
│   │   ├── 2026_06_17_000001_create_orders_table.php
│   │   └── 2026_06_21_035321_create_products_table.php
│   └── seeders/
├── public/                      # Public assets
├── resources/
│   ├── css/
│   │   └── designer.css         # Designer-specific dark-theme CSS (1328 lines)
│   ├── js/
│   │   ├── app.tsx              # Inertia app bootstrap
│   │   ├── mockdata.ts          # Frontend mock data (products, orders, categories)
│   │   ├── actions/             # Client-side action creators
│   │   ├── assets/              # Images, fonts, etc.
│   │   ├── components/          # Reusable React components
│   │   │   ├── apparel/         # 3D shirt viewer (Three.js)
│   │   │   ├── designer/        # Designer workspace (15 components)
│   │   │   ├── layouts/         # Layout wrappers
│   │   │   ├── ui/              # ShadCN-style UI primitives
│   │   │   └── ...
│   │   ├── hooks/               # Custom React hooks
│   │   ├── layouts/             # Page layout components
│   │   ├── lib/                 # Utility libraries
│   │   ├── pages/               # Inertia page components (19 pages)
│   │   ├── routes/              # Wayfinder-generated route helpers
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   └── wayfinder/           # Wayfinder runtime types
│   └── views/
│       └── app.blade.php        # Inertia root Blade template
├── routes/
│   ├── web.php                  # Main web routes
│   ├── settings.php             # Settings sub-routes
│   └── console.php              # Console/command routes
├── storage/                     # Framework storage
├── tests/                       # Pest tests
├── composer.json
├── package.json
├── vite.config.ts
├── tailwind.config.ts (via CSS)
├── tsconfig.json
├── pint.json
├── phpstan.neon
└── .env.example
```

---

## 4. DATABASE ARCHITECTURE

MongoDB database `tailorease` (tests use `tailorease_testing`). Documents use ObjectId primary keys, exposed to the app and Inertia as strings. There are no foreign keys or column types. Migrations create collections and indexes only. Eloquent models use `mongodb/laravel-mongodb`.

Connection settings: `DB_CONNECTION=mongodb`, `MONGODB_URI`, `MONGODB_DATABASE`. Sessions (`SESSION_DRIVER=mongodb`), cache (`CACHE_STORE=mongodb`), and queues (`QUEUE_CONNECTION=mongodb`) use the same database. Failed jobs are stored with the `file` driver.

### Collections

#### `users`
Fields: `name`, `email` (unique), `role` (`customer` or `tailor`, default `customer`, indexed), `email_verified_at`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `remember_token`, timestamps. `role` is fillable. Deleting a user deletes that user's orders.

#### `orders`
Fields: `customer_id`, `product_id`, `order_name`, `product_name`, `sizes` (native array), `total_quantity`, `total`, `deposit`, `remaining_balance`, `due_date`, `notes`, `has_design` (default false), `design_file_path`, `items` (native array), `status` (default `pending`), timestamps. Indexes: `customer_id`, `product_id`, `status`.

`status` is a string. Allowed values, enforced in `TailorOrderController::updateStatus()`, are `pending`, `accepted`, `deposit_paid`, `in_production`, `quality_check`, `ready`, `completed`, and `rejected`.

#### `products`
Fields: `name`, `description`, `category` (indexed), `image_path`, `base_price`, `available` (default true), `rating` (default 0), timestamps.

#### `passkeys`
WebAuthn credentials. Unique `credential_id`, index on `user_id`. The app model `App\Models\Passkey` extends Laravel's passkey model and uses the MongoDB document trait. `AppServiceProvider` registers it with `Passkeys::usePasskeyModel()`.

#### Other collections
- `password_reset_tokens` — unique `email`
- `sessions` — TTL index on `expires_at`
- `cache`, `cache_locks` — used by the MongoDB cache driver
- `jobs`, `job_batches` — used by the MongoDB queue driver

### Eloquent Relationships

```
User (1) ──< (N) Order
Product (1) ──< (N) Order
```

- `User::orders()` → `hasMany(Order::class, 'customer_id')`
- `Order::customer()` → `belongsTo(User::class)`

### Order Casts (Order.php)
- `sizes` and `items` are stored as native BSON arrays (no JSON string cast)
- `due_date` → `date`
- `has_design` → `boolean`

---

## 5. BACKEND ARCHITECTURE

### Controllers

#### OrderController (Customer-facing)
| Method | Route | Purpose |
|--------|-------|---------|
| `dashboard()` | GET /dashboard | Shows customer dashboard with their recent orders |
| `show(Request, Order)` | GET /order-tracking/{order} | Shows single order tracking. Tailors can view any; customers only their own |
| `myOrders()` | GET /my-orders | Lists all orders for the authenticated customer |
| `store(StoreOrderRequest)` | POST /orders | Creates new order. Sets `customer_id` = auth user, `status` = `pending` |
| `edit(Request, Order)` | GET /orders/{order}/edit | Shows order form pre-filled for editing |
| `update(StoreOrderRequest, Order)` | PUT /orders/{order} | Updates order, resets status to `pending` |
| `formatOrder(Order)` | (private static) | Normalizes order data for Inertia props. Handles both single-product and multi-product `items` arrays for `sizes` formatting |

**formatOrder() logic:**
- If `sizes` is a list array: joins non-empty values with commas
- If `sizes` is an assoc array: formats as `"S ×2, M ×3"` etc.
- If `items` has >1 entries: `product` field becomes comma-separated product names with quantities
- Returns a standardized array with keys: `id`, `product`, `customer_name`, `customer_email`, `quantity`, `size`, `total`, `deposit`, `due_date`, `deliveryDate`, `date`, `status`, `notes`, `hasDesign`, `items`

#### TailorOrderController (Tailor-only)
| Method | Route | Purpose |
|--------|-------|---------|
| `ensureTailor(Request)` | (private static) | Aborts 403 if user role !== `tailor` |
| `incoming()` | GET /incoming | Lists pending orders for tailor review |
| `dashboard()` | GET /tailor/dashboard | Lists ALL orders for tailor |
| `allOrders()` | GET /all-orders | Lists all orders (same as dashboard but different view) |
| `updateStatus(Request, Order)` | POST /all-orders/{order}/status | Updates order status (validated against allowed enum) |
| `export()` | GET /all-orders/export | Streams CSV export of all orders |
| `accept(Request, Order)` | POST /incoming/{order}/accept | Sets status to `accepted` (only from `pending`) |
| `reject(Request, Order)` | POST /incoming/{order}/reject | Sets status to `rejected`, appends reason to notes |

**CSV Export columns:** Order ID, Customer, Email, Product, Size, Quantity, Total, Deposit, Remaining, Order Date, Due Date, Status, Notes

#### Settings Controllers
- `ProfileController` — edit/update/destroy user profile
- `SecurityController` — edit security page (2FA, passkeys), update password

### Form Requests

#### StoreOrderRequest
Validates order creation/update:
- `product_id` — nullable string
- `product_name` — required string, max 255
- `sizes` — required array, min 1
- `total_quantity` — required integer, min 1
- `total` — required numeric, min 0
- `deposit` — required numeric, min 0
- `remaining_balance` — nullable numeric, min 0
- `due_date` — required date, after today
- `notes` — nullable string
- `has_design` — boolean
- `design_file_path` — nullable string
- `items` — nullable array (multi-product)
- `items.*.product_id` — nullable string
- `items.*.product_name` — required_with:items
- `items.*.sizes` — required_with:items, array, min 1
- `items.*.total_quantity` — required_with:items, integer, min 1
- `items.*.base_price` — required_with:items, numeric, min 0
- `items.*.subtotal` — required_with:items, numeric, min 0

### Middleware

#### HandleInertiaRequests
- Shared props: `name` (app name), `auth.user` (current user), `sidebarOpen` (from cookie `sidebar_state`)
- Root view: `app` (the Blade template)

#### HandleAppearance
- Shares `appearance` cookie value with all views (for dark/light mode in Blade)

---

## 6. FRONTEND ARCHITECTURE

### App Bootstrap (`app.tsx`)
- Uses `createInertiaApp` from `@inertiajs/react`
- **Layout resolution logic:**
  - `welcome` → no layout
  - `auth/*` → `AuthLayout`
  - `settings/*` → `[MainLayout, SettingsLayout]`
  - Everything else → `MainLayout`
- Wraps app in `TooltipProvider` and `Toaster` (Sonner)
- Calls `initializeTheme()` on load (from `use-appearance` hook)

### Layouts
| Layout | File | Purpose |
|--------|------|---------|
| `MainLayout` | `layouts/main-layout.tsx` | Sidebar + Header + content area |
| `AuthLayout` | `layouts/auth-layout.tsx` | Auth pages layout |
| `AppLayout` | `layouts/app-layout.tsx` | Settings layout wrapper (with breadcrumbs) |
| `SettingsLayout` | `layouts/settings/` | Settings sub-layouts |

### MainLayout Structure
```
┌──────────────────────────────────────────────┐
│  Header (app-header.tsx / NewHeader)          │
├──────────┬───────────────────────────────────┤
│  Sidebar │  Content Area (children)           │
│          │  ┌─────────────────────────────┐  │
│          │  │  Page Component              │  │
│          │  └─────────────────────────────┘  │
└──────────┴───────────────────────────────────┘
```

### Pages (Inertia Page Components)

| Page Component | Route Name | Inertia Page | Purpose |
|----------------|-----------|--------------|---------|
| `welcome.tsx` | home | welcome | Landing page |
| `CustomerDashboard.tsx` | dashboard | CustomerDashboard | Unified customer/tailor dashboard with internal view routing |
| `ApparelCatalog.tsx` | catalog | ApparelCatalog | Product catalog |
| `OrderForm.tsx` | order-form | OrderForm | Bulk order form with multi-product support |
| `OrderTracking.tsx` | order-tracking | OrderTracking | Single order tracking + chat |
| `MyOrders.tsx` | my-orders | MyOrders | Customer's order list |
| `Checkout.tsx` | checkout | Checkout | Payment form (mocked) |
| `PaymentSuccess.tsx` | payment-success | PaymentSuccess | Payment success page |
| `PaymentFailed.tsx` | payment-failed | PaymentFailed | Payment failed page |
| `IncomingOrders.tsx` | incoming | IncomingOrders | Tailor's incoming pending orders |
| `TailorDashboard.tsx` | tailor.dashboard | TailorDashboard | Tailor dashboard (rendered inside CustomerDashboard) |
| `AllOrders.tsx` | all-orders | AllOrders | All orders table with status editing |
| `KanbanBoard.tsx` | kanban | KanbanBoard | Kanban board for production pipeline |
| `ManageCatalog.tsx` | manage-catalog | ManageCatalog | Catalog management for tailors |
| `Reports.tsx` | reports | Reports | Reports/analytics |
| `Notifications.tsx` | notifications | Notifications | Notification center |
| `DesignerPage.tsx` | designerPage | DesignerPage | Full-screen 2D/3D design studio |
| `settings/profile.tsx` | profile.edit | settings/profile | Profile settings |
| `settings/security.tsx` | security.edit | settings/security | Security settings (2FA, passkeys) |
| `settings/appearance.tsx` | appearance.edit | settings/appearance | Appearance settings |

### CustomerDashboard.tsx — THE MAIN ROUTER
This is the **most important** frontend file. It is NOT a simple page — it is a **client-side router** that renders different sub-views based on state:

```tsx
// Internal View type
type View =
  | "dashboard" | "catalog" | "my-orders" | "order-form"
  | "order-tracking" | "payment-success" | "payment-failed"
  | "incoming" | "kanban" | "manage-catalog"
  | "reports" | "notifications" | "checkout";
```

It has a `role` state (`"customer"` | `"tailor"`) and a `view` state. The `renderView()` function switches between:
- Customer views: dashboard, catalog, my-orders, order-form, order-tracking, checkout, payment-success, payment-failed
- Tailor views: dashboard (TailorDashboard), incoming, kanban, manage-catalog

**Key implication:** Inertia navigates to `/dashboard` and `CustomerDashboard` handles ALL sub-navigation client-side. Other "pages" like `OrderForm` are rendered as children of this router, NOT via separate Inertia visits.

### Designer System Files

| File | Purpose |
|------|---------|
| `DesignerPage.tsx` | Full-screen designer workspace orchestrator |
| `DesignCanvas.tsx` | Konva 2D canvas with shirt silhouette, elements layer, transformer |
| `Studio3DLiveView.tsx` | Three.js 3D shirt live preview |
| `StudioShowcaseModal.tsx` | Export/showcase modal |
| `StudioRulers.tsx` | Measurement rulers overlay |
| `Topbar.tsx` | Designer top toolbar (undo/redo, view mode, product type, export, save) |
| `LeftSidebar.tsx` | Tools panel (text, shapes, stickers, images, lines, templates, colors) |
| `RightSidebar.tsx` | Properties panel (transform, typography, layers, image filters) |
| `MultiSidePreviewDock.tsx` | Floating front/back view switcher |
| `ZoomToolbar.tsx` | Floating zoom controls |
| `OpenDesignerButton.tsx` | Button that opens designer from OrderForm (opens in new tab via `window.open`) |
| `AlignmentToolbar.tsx` | Quick alignment buttons |
| `AssetLibrary.tsx` | Asset picker |
| `KeyboardShortcutsPanel.tsx` | Keyboard shortcuts modal |
| `PreflightInspectorModal.tsx` | Pre-flight quality/cost inspector |
| `TextEffectsPanel.tsx` | Text styling (stroke, shadow, transform) |

### Apparel 3D Components
| File | Purpose |
|------|---------|
| `ShirtViewer.tsx` | Three.js canvas wrapper with OrbitControls, front/back toggle |
| `ShirtModel.tsx` | Actual 3D shirt mesh (loaded from GLB or procedurally generated) |
| `CameraController.tsx` | Camera animation between front/back views |

---

## 7. AUTHENTICATION & AUTHORIZATION

### Auth Stack
- **Laravel Fortify** handles login, registration, password reset, email verification
- **Passkeys** (WebAuthn) via `@laravel/passkeys` package
- **Two-Factor Authentication** via Fortify's built-in 2FA
- Session-based auth with Inertia

### Route Protection
- `auth` middleware on all authenticated routes (`routes/web.php:11`)
- `verified` middleware on most routes (requires email verification)
- Tailor routes additionally check `role === 'tailor'` via `TailorOrderController::ensureTailor()`

### Role-Based Access
| Feature | Customer | Tailor |
|---------|----------|--------|
| Dashboard | Own orders | All orders |
| Catalog | Browse | Browse + manage |
| Order Form | Create | — |
| Incoming Orders | — | Accept/Reject |
| All Orders | — | View + Update Status + Export |
| Kanban | — | Yes |
| Designer | Yes | Yes |

### Shared Auth Props
Inertia shares `auth.user` globally (from `HandleInertiaRequests`). The `user` object includes:
- `id`, `name`, `email`
- `email_verified_at`
- `two_factor_enabled` (if 2FA is on)

---

## 8. ORDER LIFECYCLE & STATUS FLOW

```
pending → accepted → deposit_paid → in_production → quality_check → ready → completed
                                           ↘ rejected (from pending only)
```

### Status Descriptions
| Status | Meaning |
|--------|---------|
| `pending` | Customer submitted, awaiting tailor review |
| `accepted` | Tailor accepted, awaiting deposit |
| `deposit_paid` | Customer paid deposit, production can start |
| `in_production` | Actively being made |
| `quality_check` | Finished, QC inspection |
| `ready` | Ready for customer collection |
| `completed` | Delivered/collected |
| `rejected` | Tailor rejected (only from pending) |

### Business Rules
1. Only `pending` orders can be accepted or rejected
2. Status can be freely updated by tailors at any point (no validation of state transitions)
3. When an order is edited by a customer, status resets to `pending`
4. Deposit rate is currently hardcoded per product (50% default), but the system supports per-product rates
5. `remaining_balance = total - deposit`

---

## 9. THE DESIGNER SYSTEM (2D/3D)

### State Management
The designer uses a single React hook: `useDesigner()` in `hooks/use-designer.ts`.

**DesignerState:**
```ts
interface DesignerState {
  elements: DesignElement[];    // All design elements
  selectedId: string | null;    // Currently selected element ID
  shirtColor: string;           // Current shirt color (hex)
  activeView: ShirtView;        // "front" | "back"
  viewMode: ViewMode;           // "2d" | "split" | "3d"
  productType: ProductType;     // "tshirt" | "hoodie" | "polo" | "jersey"
  printZone: PrintZone;         // "front" | "back" | "left_chest" | "sleeve_left" | "sleeve_right"
  history: DesignElement[][];   // Undo stack (max 50)
  historyIndex: number;         // Current position in history
  zoom: number;                 // Canvas zoom (0.25 – 4)
  panX: number;                 // Pan offset X
  panY: number;                 // Pan offset Y
  showGrid: boolean;            // Grid overlay toggle
  snapEnabled: boolean;         // Snap-to-center toggle
  live3dDataUrl: string | null; // Current 2D canvas export for 3D texture
}
```

### Element Types
| Type | Interface | Description |
|------|-----------|-------------|
| `text` | `TextElement` | Text with font, size, color, stroke, shadow, alignment, transform |
| `image` | `ImageElement` | Raster image with src |
| `shape` | `ShapeElement` | rect, circle, triangle, star, diamond, hexagon |
| `sticker` | `StickerElement` | Emoji drawn as Konva text. `wrap` is `"none"` and font size is 68% of the box, because the default word wrap deletes a glyph that is wider than the box and the sticker then looks placed but paints nothing. |
| `line` | `LineElement` | Vector line with points, stroke, dash |

### Canvas Architecture
- **2D Canvas:** React Konva `Stage` (400×420px logical size)
  - Shirt body rendered as `Line` shapes with hardcoded SVG-like paths for front/back
  - Print zone overlay (dashed rectangle at x=110, y=80, w=180, h=220)
  - Optional grid overlay
  - Elements rendered in a separate `Layer` above the shirt
  - `Transformer` component handles resize/rotate of selected element
  - Snap-to-center guides (vertical + horizontal center of print zone)

- **3D View:** React Three Fiber + Drei
  - Uses `ShirtModel` component (3D mesh)
  - `OrbitControls` for interaction
  - `Environment` for lighting
  - `CameraController` for front/back animation
  - Live texture updates via `live3dDataUrl` state

### Design Flow
1. User opens designer from OrderForm (new tab or inline)
2. `DesignerPage` loads, reads `?id=` (campaign/order ID) and `?campaign=` params
3. `useDesigner()` initializes state (default: dark shirt, front view, split mode)
4. User adds elements via left sidebar tools
5. Each mutation pushes to history stack (max 50 entries)
6. On element changes, `sync3dTexture()` exports canvas to PNG and updates 3D texture
7. Save: exports canvas to JPEG, stores in `sessionStorage` with key `tailorease_design_url_{campaignId}`
8. If `onSave` callback provided (from OrderForm), passes data URL back to parent

### Templates
Built-in presets: `esports`, `varsity`, `cyberpunk`, `vintage`. Each is a predefined array of `DesignElement` objects.

### Image Filters
- `removeBackground()` — client-side background removal (uses canvas processing)
- `applyVintageDistress()` — applies vintage/distress filter

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Y / Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + G | Toggle grid |
| Ctrl/Cmd + 0 | Fit to canvas |
| Ctrl/Cmd + A | Select all |
| Delete/Backspace | Delete selected |
| Ctrl/Cmd + D | Duplicate |
| Shift + H | Flip horizontal |
| Shift + V | Flip vertical |
| Arrow keys | Nudge (1px, Shift = 10px) |
| Escape | Deselect |

### Designer CSS
- Separate stylesheet: `resources/css/designer.css`
- Dark theme with CSS custom properties
- Scoped class names prefixed with `ds-` or `designer-`
- Not using Tailwind classes — pure CSS with design tokens

---

## 10. ROUTING & NAVIGATION

### Laravel Routes (`routes/web.php`)
```php
// Public
Route::inertia('/', 'welcome')->name('home');

// Authenticated + Verified
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [OrderController::class, 'dashboard'])->name('dashboard');
    Route::inertia('catalog', 'ApparelCatalog')->name('catalog');
    Route::get('my-orders', [OrderController::class, 'myOrders'])->name('my-orders');
    Route::inertia('notifications', 'Notifications')->name('notifications');
    
    // Tailor-only (enforced in controller)
    Route::get('incoming', [TailorOrderController::class, 'incoming'])->name('incoming');
    Route::post('incoming/{order}/accept', ...)->name('incoming.accept');
    Route::post('incoming/{order}/reject', ...)->name('incoming.reject');
    Route::get('all-orders', [TailorOrderController::class, 'allOrders'])->name('all-orders');
    Route::post('all-orders/{order}/status', ...)->name('all-orders.update-status');
    Route::get('all-orders/export', ...)->name('all-orders.export');
    Route::inertia('kanban', 'KanbanBoard')->name('kanban');
    Route::inertia('manage-catalog', 'ManageCatalog')->name('manage-catalog');
    Route::inertia('reports', 'Reports')->name('reports');
    Route::get('tailor/dashboard', [TailorOrderController::class, 'dashboard'])->name('tailor.dashboard');
    
    // Orders
    Route::inertia('order-form', 'OrderForm')->name('order-form');
    Route::post('orders', [OrderController::class, 'store'])->name('orders.store');
    Route::get('orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit');
    Route::put('orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::get('order-tracking/{order}', [OrderController::class, 'show'])->name('order-tracking');
    
    // Payments (mocked)
    Route::inertia('payment-success', 'PaymentSuccess')->name('payment-success');
    Route::inertia('payment-failed', 'PaymentFailed')->name('payment-failed');
    Route::inertia('checkout', 'Checkout')->name('checkout');
    
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// Designer (separate middleware group, no verified required)
Route::middleware(['auth', 'verified'])->get('/designer', function() {
    return Inertia::render('DesignerPage');
})->name('designerPage');

// Settings (from routes/settings.php)
// Profile, Security, Appearance routes

// Passkey endpoints
Route::get('.well-known/passkey-endpoints', ...)->name('well-known.passkeys');
```

### Frontend Routes (Wayfinder)
Generated in `resources/js/routes/index.ts` via `@laravel/vite-plugin-wayfinder`.
Each route exports: `routeName()`, `routeName.url()`, `routeName.get()`, `routeName.post()`, etc.
Form variants are enabled: `routeName.form` provides Inertia form helpers.

### Navigation Pattern
- **Main app:** Uses `router.visit()` or `router.get()` / `router.post()` / `router.put()` from `@inertiajs/react`
- **Designer page:** Opens in a new browser tab via `window.open('/designer?id=...&campaign=...')`
- **CustomerDashboard:** Internal state-based routing (no Inertia visits for sub-views)

---

## 11. DATA FLOW: REQUEST → RESPONSE

### Typical Order Placement Flow
```
1. Customer visits /catalog
   → Inertia renders ApparelCatalog with auth props

2. Customer clicks "Order Now" on a product
   → navigate("order-form") sets selectedProduct
   → OrderForm renders with product prop

3. Customer fills sizes, due date, uploads design
   → All state is local React state
   → No API calls until submit

4. Customer clicks "Submit Order Request"
   → router.post('/orders', payload)
   → Payload includes:
      - product_id, product_name (first item for backward compat)
      - sizes (first item's sizes)
      - total_quantity, total, deposit, remaining_balance
      - due_date, notes, has_design, design_file_path
      - items: [{ product_id, product_name, sizes, total_quantity, base_price, subtotal }]

5. Laravel receives POST /orders
   → StoreOrderRequest validates
   → OrderController::store()
   → Sets customer_id = Auth::id(), status = 'pending'
   → Order::create($validated)
   → Redirects to /my-orders with success flash

6. Inertia processes redirect
   → CustomerDashboard renders with "my-orders" view
   → usePage().props.orders contains the new order
```

### Designer Save Flow
```
1. OrderForm renders OpenDesignerButton
   → onClick: window.open('/designer?id=123&campaign=MyOrder')

2. DesignerPage opens in new tab
   → Reads ?id= and ?campaign= from URL
   → storageKey = 'tailorease_design_url_123'

3. User designs, clicks "Save Design"
   → exportToDataURL("image/jpeg") captures canvas
   → sessionStorage.setItem(storageKey, dataUrl)
   → If onSave callback: onSave(dataUrl) → updates OrderForm's designUrl state
   → Else: window.history.back()

4. Back in OrderForm tab
   → ShirtViewer shows the design on 3D shirt
   → On form submit: fileName = extracted from sessionStorage or passed via onSave
```

### Tailor Order Management Flow
```
1. Tailor visits /incoming
   → TailorOrderController::incoming()
   → Ensures role === 'tailor'
   → Fetches pending orders with customer relationship
   → formatOrder() normalizes data
   → Renders IncomingOrders with orders prop

2. Tailor clicks "Accept"
   → router.post('/incoming/{id}/accept')
   → Status → 'accepted'
   → Order removed from incoming list (frontend filter)

3. Tailor clicks "Reject"
   → Opens modal with reason options
   → router.post('/incoming/{id}/reject', { reason })
   → Status → 'rejected', reason appended to notes

4. Tailor visits /all-orders
   → Can update status via dropdown + "Update Status" button
   → router.post('/all-orders/{id}/status', { status })
```

---

## 12. SHARED PROPS & STATE MANAGEMENT

### Inertia Shared Props (every page gets these)
```ts
{
  name: string;              // App name from config
  auth: {
    user: User | null;       // Authenticated user or null
  };
  sidebarOpen: boolean;      // Sidebar collapsed state from cookie
  // Plus any flashes, errors, etc. from session
}
```

### Flash Messages
- Success/error flashes via `->with('success', '...')` on redirects
- Inertia automatically provides `flash` prop on next request
- App uses `sonner` Toaster for toast notifications (in `app.tsx`)

### Client-Side State
- **No global state manager** (no Redux, no Zustand, no Context API for app state)
- State is localized to each page component
- `CustomerDashboard` holds the master `view` state and passes it down
- `OrderForm` holds all form state locally
- Designer state is encapsulated in `useDesigner()` hook

---

## 13. API CONTRACTS: INERTIA SHARED DATA

### Page Props Contracts

#### OrderController::formatOrder() → Used by dashboard, my-orders, order-tracking
```ts
{
  id: string;
  product: string;           // Single product name or comma-separated multi-product
  customer_name: string;
  customer_email: string;
  quantity: number;
  size: string;              // Human-readable size breakdown
  total: number;
  deposit: number;
  due_date: string;          // YYYY-MM-DD
  deliveryDate: string;      // e.g. "Jun 28, 2026"
  date: string;              // e.g. "May 28, 2026"
  status: string;
  notes: string | null;
  hasDesign: boolean;
  items: any[] | null;       // Multi-product items array
}
```

#### TailorOrderController::formatOrder() → Used by tailor pages
```ts
{
  id: string;
  customer: string;
  customerEmail: string;
  avatar: string;            // Two-letter initials
  product: string;
  productId: string;
  size: string;
  quantity: number;
  total: number;
  deposit: number;
  remaining: number;
  deliveryDate: string;      // YYYY-MM-DD
  date: string;              // e.g. "Jun 2, 2026"
  status: string;
  notes: string | null;
  hasDesign: boolean;
}
```

---

## 14. KEY BUSINESS LOGIC

### Order Totals Calculation (Frontend, OrderForm.tsx)
```ts
const depositRate = orderItems[0]?.product.depositRate ?? 0.5;
const deposit = Math.round(subtotal * depositRate);
const remaining = Math.max(0, Math.round(subtotal - deposit));
```
- Deposit rate comes from the first product in the order
- All products currently share 50% deposit rate in mock data

### Size Handling
- Frontend uses `BulkSize` type: `'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'`
- Backend `sizes` field is an array. It can be either:
  - List: `["M", "L", "XL"]` (just size names with quantities implied by separate field?)
  - Assoc: `{"M": 2, "L": 1, "XL": 3}` (size → quantity mapping)
- `total_quantity` is stored separately as integer

### Multi-Product Orders
- `items` array stores per-product breakdown:
  ```json
  [
    {
      "product_id": "p1",
      "product_name": "Collarless T-Shirt",
      "sizes": {"S": 2, "M": 3},
      "total_quantity": 5,
      "base_price": 35,
      "subtotal": 175
    }
  ]
  ```
- Top-level `sizes`, `product_id`, `product_name`, `total_quantity` are set from the FIRST item for backward compatibility

### Design File Handling
- Design files are uploaded as regular files (no S3/cloud storage configured)
- `has_design` boolean flag indicates if a design exists
- `design_file_path` stores the filename
- The designer exports to `sessionStorage` — this means designs are temporary and session-scoped
- **No persistent server-side storage of design files** — only the filename/reference is saved

---

## 15. FILE STORAGE & MEDIA

### Current Setup
- `config/filesystems.php` — uses default `local` disk
- Product images referenced by the `image_path` field
- Design files stored via standard file upload (no disk configuration visible)
- No S3/cloud storage configured in `.env.example`

### Product Images
- Mock data uses both local paths (`/products-images/...`) and Unsplash URLs
- Product documents store `image_path`

### Design Exports
- Designer exports are JPEG/PNG data URLs
- Stored in `sessionStorage` (client-side only)
- When passed to `ShirtViewer`, used as texture URL for Three.js

---

## 16. BUILD SYSTEM & DEV WORKFLOW

### Local Docker
Docker Desktop runs the whole app. Herd is not used for this project.

```bash
docker compose up --build
docker compose exec app php artisan db:seed
docker compose exec app php artisan test
```

- App: `http://localhost:8000` (PHP, queue listener, and Vite in one container)
- Vite: port 5173, HMR host `localhost`, file watching uses polling. `node_modules` is a Docker volume so Vite can rewrite its dependency cache (a Windows bind mount rejects that rename).
- MongoDB 8: `mongodb://localhost:27017` from the host, database `tailorease`
- The container connection string is `mongodb://mongodb:27017/?replicaSet=rs0` (single-node replica set so Laravel transactions and `RefreshDatabase` work)
- Seed once after the first boot. `docker compose up` migrates, and it does not seed on every start.

`composer dev` still starts the PHP server, queue listener, and Vite, but those processes are meant to run inside the `app` container, which binds them to `0.0.0.0`.

### Build Pipeline
1. **Vite** bundles `resources/css/app.css` + `resources/js/app.tsx`
2. **Laravel Vite Plugin** handles Blade `@vite` directives
3. **Inertia Vite Plugin** bundles the page component dynamically:
   ```
   resources/js/pages/{pageName}.tsx
   ```
4. **Wayfinder Plugin** generates `resources/js/routes/index.ts` with type-safe route helpers
5. **Tailwind CSS Vite Plugin** processes CSS

### Production Build
```bash
npm run build    # Vite production build
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Code Quality
```bash
npm run lint              # ESLint --fix
npm run lint:check        # ESLint check only
npm run format            # Prettier --write
npm run format:check      # Prettier check only
npm run types:check       # TypeScript tsc --noEmit
composer pint             # Laravel Pint (code style)
composer phpstan          # Static analysis
composer test             # Pest tests
composer ci:check         # All checks combined
```

---

## 17. TESTING & QUALITY

### Test Framework
- **Pest PHP** (v4) with Laravel plugin
- Test directory: `tests/`
- PHPUnit config: `phpunit.xml` (MongoDB database `tailorease_testing`, `RefreshDatabase` on feature tests). `tests/bootstrap.php` writes that database name into `$_SERVER` as well as `$_ENV`, because Docker Compose already sets `MONGODB_DATABASE=tailorease` and Laravel reads `$_SERVER` first.
- Run tests inside the app container: `docker compose exec app php artisan test`

### Static Analysis
- **Larastan** (PHPStan for Laravel) — config in `phpstan.neon`
- **TypeScript** strict checking via `tsc --noEmit`

### Code Style
- **Laravel Pint** for PHP (PSR-12 based)
- **Prettier** for JS/TS/CSS/JSON
- **ESLint** with React, import, TypeScript plugins

### CI
GitHub Actions workflow exists in `.github/` (not fully explored, but `composer ci:check` is the local equivalent).

---

## 18. KNOWN ISSUES & QUIRKS

1. **Designer uses sessionStorage:** Designs are NOT persisted server-side. If the user closes the tab, the design is lost unless saved elsewhere.

2. **CustomerDashboard is a monolith:** It combines customer and tailor views in one file with a `role` state toggle. The role toggle appears to be for demo purposes (no real role switching UI in the rendered output). This makes the file very large and hard to maintain.

3. **Mock data in production code:** `resources/mockdata.ts` and inline mock data in `CustomerDashboard.tsx` suggest this is still in active development. The `CustomerDashboard` uses `MOCK_ORDERS` hardcoded array while `usePage().props.orders` is also available.

4. **Duplicate CalendarPicker component:** `CalendarPicker` is defined both in `OrderForm.tsx` and `CustomerDashboard.tsx` (nearly identical copies). Should be extracted to a shared component.

5. **Duplicate STATUS_CONFIG:** Defined in multiple files (`CustomerDashboard.tsx`, `AllOrders.tsx`, `IncomingOrders.tsx`, `mockdata.ts`). Should be centralized.

6. **OpenDesignerButton opens new tab:** Uses `window.open()` which may be blocked by popup blockers. Consider inline modal or same-tab navigation.

7. **No real payment integration:** Checkout, PaymentSuccess, PaymentFailed are all mocked UI.

8. **Fortify settings routes mixed with custom routes:** `routes/settings.php` is required from `routes/web.php` but uses a different middleware structure.

---

## 19. FUTURE EXTENSION POINTS

### Recommended Improvements
1. **Extract shared components:**
   - `CalendarPicker` → `resources/js/components/shared/CalendarPicker.tsx`
   - `STATUS_CONFIG` → `resources/js/constants/orderStatus.ts`
   - `urgencyMeta()` → `resources/js/utils/dateUtils.ts`
2. **Persist designs server-side:** Upload to `storage/app/designs/` and store path in `design_file_path`
3. **Implement real payment gateway** (Stripe, PayPal, etc.)
4. **Add role management UI** (admin panel to assign roles)
5. **Break down CustomerDashboard** into separate page components per view
6. **Add product CRUD** (currently `ManageCatalog` is a placeholder)
7. **Add real-time notifications** (WebSockets/Pusher)
8. **Add order messaging** (currently local state only, not persisted)
9. **Implement actual email sending** (order confirmations, status updates)
10. **Add inventory/stock tracking** for products
11. **Add reporting backend** (Reports page exists but has no real data source)

---

## APPENDIX: QUICK REFERENCE — WHERE IS X?

### Controllers
- Order CRUD: `app/Http/Controllers/OrderController.php`
- Tailor operations: `app/Http/Controllers/TailorOrderController.php`
- Settings: `app/Http/Controllers/Settings/ProfileController.php`, `SecurityController.php`

### Models
- User: `app/Models/User.php`
- Order: `app/Models/Order.php`
- Product: `app/Models/Product.php`
- Passkey: `app/Models/Passkey.php`

### Migrations
- Users: `database/migrations/0001_01_01_000000_create_users_table.php`
- Orders: `database/migrations/2026_06_17_000001_create_orders_table.php`
- Products: `database/migrations/2026_06_21_035321_create_products_table.php`
- Passkeys: `database/migrations/2024_01_01_000000_create_passkeys_table.php`

### Key Frontend Files
- App bootstrap: `resources/js/app.tsx`
- Main router/dashboard: `resources/js/pages/CustomerDashboard.tsx`
- Order form: `resources/js/pages/OrderForm.tsx`
- Designer: `resources/js/pages/DesignerPage.tsx`
- Designer hook: `resources/js/hooks/use-designer.ts`
- Designer types: `resources/js/types/designer.ts`
- Designer CSS: `resources/css/designer.css`
- Mock data: `resources/mockdata.ts`
- Route helpers: `resources/js/routes/index.ts`

### Configuration
- Fortify features: `config/fortify.php`
- Inertia: `config/inertia.php`
- Vite: `vite.config.ts`
- TypeScript: `tsconfig.json`
- ESLint: `eslint.config.js`
- Prettier: `.prettierrc`

---

*End of SYSTEM_CONTEXT.md. Update this document whenever system architecture, data models, routing, or key business logic changes.*
