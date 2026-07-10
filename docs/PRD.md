# Product Requirements Document (PRD)

## AUREXIVA — Premium Multi-Category E-Commerce Platform

| Field | Details |
|---|---|
| Project Name | Aurexiva Products E-Commerce Website |
| Client | Aurexiva Product Private Limited |
| Public Brand Name | AUREXIVA |
| Version | 2.0 (Complete) |
| Document Owner | Ekansh Saxena |
| Timeline | 7–10 Days |
| Status | In Development |
| Repository | `aurexiva` (React 19 + TypeScript + Vite) |

> **Change log:** v2.0 expands the v1.0 draft into a build-ready spec — adds current implementation status, detailed data model with column types and RLS policies, API/service-layer contracts, day-by-day delivery plan, non-functional requirements, risks, and sign-off criteria. No business intent from v1.0 was changed, only clarified and made testable.

---

## 1. Product Overview

### 1.1 Objective

Develop a premium, responsive, multi-category e-commerce website for **Aurexiva Product Private Limited** where customers can browse products, create an account, add items to a cart, securely complete purchases online, and view their previous orders.

The product must read as **premium, minimal, and trustworthy** — the visual and interaction quality is itself a conversion lever, not decoration.

### 1.2 Business Goals

- Establish a credible, direct-to-consumer online presence for the AUREXIVA brand.
- Increase online sales through a low-friction browse → cart → checkout flow.
- Showcase premium products (Footwear, Kids Clothing, Electronics) with editorial-quality presentation.
- Build customer trust via transparent policies, secure auth, and secure payments.
- Ship an architecture that supports future expansion (new categories, admin tooling, loyalty features) without a rewrite.

### 1.3 Target Audience

| Segment | Description |
|---|---|
| Primary | Adults 18–45 interested in Footwear, Kids Clothing, Electronics |
| Secondary | Returning customers (repeat purchase, order tracking) |

### 1.4 Success Metrics

| Metric | Target |
|---|---|
| Responsiveness | 100% of pages usable on Desktop, Laptop, Tablet, Mobile |
| Page load (initial) | < 2 seconds on 4G/broadband |
| Checkout completion friction | ≤ 3 steps from cart to confirmation |
| Auth security | Email verification + RLS enforced on 100% of user-owned tables |
| Payment security | No card data touches Aurexiva's own servers (gateway-hosted fields only) |
| Branding | Passes internal design QA against reference brands (Section 19) |

---

## 2. Current Implementation Status

This section maps the PRD against what already exists in the repository, so work is scoped as **delta**, not from-scratch guessing.

### 2.1 Already built (frontend mockup, local state only)

| Area | Status | Notes |
|---|---|---|
| Design system (`src/index.css` `@theme`) | ✅ Done | Matches Section 19 brand principles |
| Routing (`src/routes/index.tsx`) | ✅ Done | All MVP routes exist under `AppLayout` |
| Navbar, Footer, Layout | ✅ Done | Scroll-aware navbar, mobile drawer |
| Home page | ✅ Done (mock data) | Hero, Trust Bar, Categories, Best Sellers, Offer Banner |
| Products listing + filters | ✅ Done (mock data) | Search + category filter via URL params |
| Product detail | ✅ Done (mock data) | Size selection, add-to-bag (local state only) |
| Cart page | ✅ Done (local state only) | Quantity update, remove, totals |
| Checkout page | ✅ Done (mock submit) | RHF + Zod validated form, no real payment |
| Login / Register pages | ✅ UI only | No Supabase Auth wired up |
| Profile / Orders pages | ✅ UI only, mock data | Not reading from a database |
| UI primitives (Button, Input, Badge, SearchInput) | ✅ Done | Hand-built, not shadcn/ui |

### 2.2 Not yet built (this PRD's scope)

- Supabase project: schema, RLS policies, storage buckets
- Supabase Auth wiring (register, login, verify email, reset password, logout, session persistence)
- Replacing `DUMMY_PRODUCTS` / `DUMMY_CATEGORIES` with TanStack Query hooks against Supabase
- Global cart state (persisted per-user in `cart_items`, guest cart in `localStorage` merged on login)
- Real checkout → order creation → payment gateway session
- Orders/Profile pages reading live data with RLS-scoped queries
- Deployment pipeline (Vercel + Supabase env wiring)

### 2.3 Open decision: shadcn/ui

The PRD's target stack lists `shadcn/ui`, but the current UI kit (`src/components/ui/*`) is hand-built and already matches the brand's custom design tokens.

**Recommendation:** keep the existing hand-built primitives for visual components (Button, Input, Badge) since they already match the premium/minimal brand spec pixel-for-pixel, and reserve `shadcn/ui` only for complex interaction primitives we don't already have (e.g. `Dialog`, `Select`, `Toast`, `Sheet` for the mobile cart drawer) — installed via the shadcn CLI so they inherit the existing `@theme` tokens. This avoids restyling shadcn's default look while still getting accessible, tested interaction behavior for free. Flagging for client/owner confirmation before Day 3 (see Section 21).

---

## 3. User Roles & Permissions

| Capability | Guest | Customer (authenticated) |
|---|---|---|
| Browse products / categories | ✅ | ✅ |
| Search | ✅ | ✅ |
| View product details | ✅ | ✅ |
| Add to cart | ✅ (local/guest cart) | ✅ (persisted) |
| Checkout / place order | ❌ (redirected to login) | ✅ |
| View own orders | ❌ | ✅ |
| View/edit own profile | ❌ | ✅ |
| View other users' data | ❌ | ❌ (blocked by RLS) |

Guest carts are stored in `localStorage`; on successful login/register they are merged into the user's `cart_items` rows (last-write-wins per `product_id` + `variant`/size).

---

## 4. Authentication

**Provider:** Supabase Auth, Email + Password.

| Flow | Behavior |
|---|---|
| Register | Email + password + full name → Supabase `signUp` → verification email sent → `profiles` row auto-created via DB trigger on `auth.users` insert |
| Verify Email | User must confirm before checkout is enabled (browsing remains open) |
| Login | Supabase `signInWithPassword`; session persisted via Supabase client (`localStorage`, auto-refresh) |
| Reset Password | "Forgot password" → email link → Supabase recovery flow → new password form |
| Logout | Clears Supabase session; cart falls back to guest/local mode |

Session state is exposed app-wide via a React context (`AuthProvider`) wrapping `App.tsx`, backed by `supabase.auth.onAuthStateChange`.

---

## 5. Product Categories (MVP)

- Footwear
- Kids Clothing
- Electronics

Category taxonomy is data-driven (`categories` table), not hardcoded, so a 4th category can be added post-launch without a code change.

---

## 6. Information Architecture / Navigation

**Navbar:** Home · Footwear · Kids Clothing · Electronics
**Icons:** Search · Profile (login state aware) · Cart (live item-count badge)

Active navigation state (current route highlighting) is required on every route, including category-filtered product listings.

---

## 7. Landing Page — Section Order

1. Hero
2. Trust Bar
3. Categories
4. Best Sellers
5. Offer Banner
6. Footer

---

## 8. Functional Requirements

### 8.1 Home (`/`)
- Hero banner (CTA into `/products`)
- Categories grid (image, name, live product count from DB)
- Best Sellers (query: top N products, flagged or by order volume)
- Offer Banner (static/CMS-light content)

### 8.2 Products Listing (`/products`)
- Grid layout: image, name, price
- Search (`?search=`) — server-side `ilike` query on product name/description
- Category filter (`?category=`)
- Loading skeleton state while query is in flight
- Empty state when no results match

### 8.3 Product Details (`/product/:slug`)
- Image gallery, description, price
- Variant/size selector (Footwear: US 8–11; Kids Clothing: 2–3Y to 8–9Y; Electronics: no size selector)
- Add to Cart (guest → local storage; authenticated → `cart_items` upsert)
- Related products (same category, excluding current product)
- 404 fallback if slug doesn't resolve to an active product

### 8.4 Cart (`/cart`)
- Update quantity (with stock-aware upper bound if inventory tracking is enabled later — out of scope for MVP, see Section 12)
- Remove item
- Live subtotal, shipping placeholder, total
- "Proceed to Checkout" — gated behind auth; guest is redirected to `/login?redirect=/checkout`

### 8.5 Checkout (`/checkout`)
- Contact info, shipping address, billing address (Zod-validated, RHF)
- Order summary (line items, totals) sourced from live cart
- Payment step (Section 13)
- On success: creates `orders` + `order_items` rows, clears cart, redirects to confirmation

### 8.6 Orders (`/orders`)
- List of the authenticated user's past orders: ID, date, status, total
- Order detail (line items, shipping address, status)

### 8.7 Profile (`/profile`)
- Name, email (from `profiles` + `auth.users`)
- Editable default shipping address
- Link to order history

---

## 9. Data Model (Supabase / PostgreSQL)

All tables use `uuid` primary keys (`gen_random_uuid()`) and `created_at` / `updated_at` timestamps unless noted.

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → `auth.users.id`, PK |
| full_name | text | |
| default_address | jsonb | line1, line2, city, state, postal_code, country |
| created_at | timestamptz | |

### `categories`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | unique |
| slug | text | unique, indexed |
| image_url | text | Supabase Storage path |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| category_id | uuid | FK → `categories.id` |
| name | text | |
| slug | text | unique, indexed |
| description | text | |
| price | numeric(10,2) | |
| images | text[] | Storage URLs |
| variants | jsonb | e.g. `["US 8","US 9",...]` or size labels |
| is_best_seller | boolean | default `false` |
| is_active | boolean | default `true` — soft-delete/hide instead of deleting |

### `cart_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `auth.users.id` |
| product_id | uuid | FK → `products.id` |
| variant | text | nullable |
| quantity | int | > 0 |
| unique (user_id, product_id, variant) | | upsert target |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → `auth.users.id` |
| status | text | `pending` \| `paid` \| `shipped` \| `delivered` \| `cancelled` |
| shipping_address | jsonb | snapshot at time of order |
| subtotal | numeric(10,2) | |
| total | numeric(10,2) | |
| payment_reference | text | gateway session/txn id |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| order_id | uuid | FK → `orders.id` |
| product_id | uuid | FK → `products.id` (nullable on delete, keep snapshot) |
| product_name | text | snapshot |
| variant | text | snapshot |
| unit_price | numeric(10,2) | snapshot |
| quantity | int | |

---

## 10. Row Level Security (RLS)

RLS is **on** for every table above. Baseline policy set:

| Table | Policy |
|---|---|
| `profiles` | `SELECT/UPDATE` where `auth.uid() = id`; no `DELETE` |
| `categories` | Public `SELECT`; writes reserved for a future service-role/admin context (no client write policy in MVP) |
| `products` | Public `SELECT` where `is_active = true`; writes reserved for service-role/admin |
| `cart_items` | `SELECT/INSERT/UPDATE/DELETE` where `auth.uid() = user_id` |
| `orders` | `SELECT` where `auth.uid() = user_id`; `INSERT` where `auth.uid() = user_id`; no client-side `UPDATE`/`DELETE` (status changes happen via server-side/service-role logic, e.g. payment webhook) |
| `order_items` | `SELECT` via join — allowed where the parent `orders.user_id = auth.uid()`; `INSERT` only alongside a matching `orders` row created in the same transaction |

Product/category writes and order-status transitions are intentionally **not** exposed to the anon/authenticated client role — there is no admin panel in MVP (Section 12), so those writes happen via the Supabase SQL editor or a service-role script during catalog setup, and order status updates happen via the payment webhook handler.

---

## 11. Payments

- **Gateway:** Client's bank API — credentials (Merchant ID, API Keys, Gateway URL, Webhook Secret) not yet received; **or** Razorpay as a fallback if the bank integration is delayed. Final choice pending client confirmation.
- **Architecture (built, Day 6):** payment logic lives entirely behind a provider-agnostic module at `src/services/payment/` — `IPaymentProvider` (payment.types.ts) defines `initializePayment / verifyPayment / handleSuccess / handleFailure / refundPayment / getPaymentStatus`; pages call only `paymentService`, never a provider or gateway SDK directly. `MockPaymentProvider` implements the full flow today (simulated gateway page at `/payment/gateway/:orderId`) so checkout is testable end-to-end with zero external dependency. `BankPaymentProvider` is a TODO-marked placeholder ready for the bank's credentials — see `supabase/README.md` §7 for the exact swap-over steps. Estimated integration time once credentials arrive: under an hour, touching only `payment.config.ts`, `bank.provider.ts`, three Supabase Edge Functions, and environment variables.
- Card/payment data is captured entirely within the gateway's hosted fields/redirect flow — Aurexiva's frontend and Supabase never store raw card data (PCI scope stays with the gateway). Checkout's own form collects only contact + shipping info.
- Order status moves `pending` → `paid` via a webhook (Supabase Edge Function, scaffolded at `supabase/functions/payment-webhook`, not yet deployed) verified against the gateway's signature, not via a client-side call. **Current MVP simplification:** since the mock provider has no real server to call back, the client writes the simulated result directly (see the security note in `supabase/migrations/0004_payment.sql`) — this must be replaced by webhook-only writes before going live with the real bank gateway.
- Secret keys and webhook secrets are never placed in `VITE_` environment variables (those are bundled into public JS); they live only in Supabase Edge Function secrets.

---

## 12. Out of Scope (MVP)

- Admin Panel
- Inventory management (stock counts / out-of-stock enforcement)
- Coupons / discount codes
- Wishlist
- Product Reviews
- Product Comparison
- Vendor Dashboard
- Analytics Dashboard

These are explicitly deferred to Phase 2 (Section 22) so scope doesn't creep during the 7–10 day build.

---

## 13. Security

- HTTPS everywhere (enforced by Vercel).
- Supabase Auth for identity; no custom password handling.
- Mandatory email verification before checkout.
- RLS enforced on every table (Section 10) — no table is left with a permissive default policy.
- Secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, payment gateway keys) live in environment variables, never committed; `.env` is git-ignored.
- Payment gateway secret keys live only in Supabase Edge Function secrets, never in frontend bundle.

---

## 14. Performance Goals

| Metric | Target |
|---|---|
| Page load | < 2s |
| Lighthouse Performance | 90+ |
| Lighthouse Accessibility | 95+ |
| Lighthouse SEO | 90+ |
| Lighthouse Best Practices | 95+ |

Practical levers: image optimization/lazy-loading for product images, route-level code splitting, TanStack Query caching to avoid redundant fetches, and avoiding layout shift via skeleton states already present in the mockup.

---

## 15. Responsive Breakpoints

Desktop · Laptop · Tablet · Mobile (including landscape orientation). All existing components already use Tailwind's responsive utilities; new components must follow the same breakpoint set rather than introducing ad hoc ones.

---

## 16. UI Principles

**Feel:** Premium, Luxury, Minimal, Editorial, Timeless.
**Inspiration:** Apple, COS, Vercel, Stripe, Zara.
**Avoid:** Purple, Neon, Glassmorphism, heavy shadows, generic templates.

This is already encoded in the `@theme` tokens (Section 2.1) — any new component (payment step, auth forms, order status badges) must draw from the existing palette/typography/radius scale rather than introducing new colors or shadow styles.

---

## 17. Brand Identity

- Public-facing name: **AUREXIVA** — used throughout the UI, marketing copy, and page titles.
- Legal entity name **"Aurexiva Product Private Limited"** appears only in: Privacy Policy, Terms & Conditions, footer copyright line, and other legal documents.

---

## 18. User Journey

Guest → Browse Products → Product Details → Register/Login → Add to Cart → Checkout → Payment → Order Confirmation → Previous Orders

Note: in the current mockup, Add to Cart happens *before* auth is required (guest can build a cart); auth is only enforced at Checkout. This is intentional — it reduces friction and matches standard e-commerce UX (Zara, COS) — flagged here since the v1.0 diagram implies login before cart.

---

## 19. MVP Scope

- Premium Landing Page
- Product Listing
- Product Details
- Categories
- Search
- Authentication (Supabase, email+password)
- Cart (persisted for authenticated users)
- Checkout
- Payment (gateway TBD, architecture gateway-agnostic)
- Orders
- Responsive Design

---

## 20. Future Scope (Phase 2)

- Admin Panel
- Product Management
- Inventory
- Coupons
- Reviews
- Wishlist
- Notifications
- Analytics
- Invoice Generation
- Google Login
- Phone Login

---

## 21. Delivery Plan (7–10 Days)

| Day | Focus | Exit Criteria |
|---|---|---|
| 1 | Supabase project setup: schema (Section 9), RLS policies (Section 10), storage buckets for product/category images | Tables + policies deployed; verified via Supabase SQL editor test queries |
| 2 | Auth wiring: register/login/verify/reset/logout, `AuthProvider` context, route guards on `/checkout`, `/orders`, `/profile` | Full auth flow works end-to-end against a real Supabase project |
| 3 | shadcn/ui decision finalized (Section 2.3); replace `DUMMY_CATEGORIES`/`DUMMY_PRODUCTS` on Home + Products with TanStack Query hooks | Home & Products render live Supabase data, search/filter work server-side |
| 4 | Product Details wired to live data; related products query; global cart state (`cart_items` for auth users, localStorage for guests) + merge-on-login | Add-to-cart persists across reload for logged-in users |
| 5 | Cart page wired to live `cart_items`; Navbar cart badge reflects real count | Quantity update/remove reflected instantly across Navbar + Cart |
| 6 | Checkout: address form → order/order_items creation; payment gateway integration (Section 11) | Test order completes and appears in `orders` table with correct totals |
| 7 | Orders + Profile pages wired to live, RLS-scoped data | Authenticated user sees only their own orders/profile, verified against a second test account |
| 8 | Cross-page QA: active nav state, responsive pass on all breakpoints, empty/error/loading states | No visual regressions across Desktop/Laptop/Tablet/Mobile |
| 9 | Performance pass (Lighthouse, Section 14), accessibility pass, deployment to Vercel + Supabase production project | Lighthouse targets met; production URL live |
| 10 | Buffer / client review / fixes | Client sign-off (Section 24) |

---

## 22. Risks & Assumptions

| Risk | Mitigation |
|---|---|
| Payment gateway not finalized by Day 6 | Architecture is gateway-agnostic (Section 11); can ship with a stubbed/sandbox gateway and swap post-launch |
| Client requests shadcn/ui strictly (design mismatch risk) | Flag decision explicitly by Day 3 (Section 2.3) before broad component work begins |
| No inventory tracking in MVP means overselling is possible | Explicitly out of scope (Section 12); flagged to client as a known MVP limitation, not a bug |
| Email deliverability for verification/reset emails | Use Supabase's default SMTP for MVP; recommend a custom SMTP provider (e.g. Resend/Postmark) if delivery issues appear |

---

## 23. Deliverables

- React frontend (deployed)
- Supabase backend (schema, RLS, storage, auth configured)
- Responsive UI across all breakpoints
- Source code (GitHub repository)
- Deployment (Vercel + Supabase production project)
- Database schema (SQL migration files, versioned in repo)
- Documentation (this PRD + README updates)
- Environment variable guide (`.env.example` with all required keys, no real secrets)
- Handover notes (admin/service-role operations for catalog management until Phase 2's admin panel exists)

---

## 24. Acceptance Criteria

The project is complete when:

- [ ] All pages are responsive across Desktop, Laptop, Tablet, and Mobile.
- [ ] Authentication (register, login, verify email, reset password, logout) works correctly end-to-end.
- [ ] Products and categories are displayed from Supabase, not mock data.
- [ ] Users can add and remove items from the cart, persisted per-user.
- [ ] Checkout collects address and payment info and creates a valid order.
- [ ] Payment integration is functional (sandbox or live, per client decision).
- [ ] Orders are stored in the database with correct line items and totals.
- [ ] Previous orders are visible only to the authenticated user who placed them (RLS verified).
- [ ] Active navigation state works correctly on all routes.
- [ ] Performance meets the targets in Section 14.
- [ ] The application is deployed successfully (Vercel + Supabase production).
- [ ] The client signs off on final delivery.

---

## 25. Glossary

- **RLS** — Row Level Security, PostgreSQL/Supabase feature restricting row access per authenticated user.
- **MVP** — Minimum Viable Product, the Phase 1 scope defined in Section 19.
- **Guest cart** — cart state held in `localStorage` for unauthenticated users, merged into `cart_items` on login/register.
- **Service role** — a privileged Supabase key used for admin-style writes (catalog setup, order status updates) that is never exposed to the browser.
