# CAFIO Coffee Shop E-commerce Development Plan

## 1. Project Goal

Build a production-ready coffee shop e-commerce platform for direct online ordering using:

- `Next.js` for the web application
- `Prisma ORM` for data access
- `PostgreSQL` as the SQL database
- `Vercel` for deployment
- `Stripe` or another supported gateway for payments

This plan is based on the proposal document dated `March 7, 2026`, adapted to the current repository, which is presently a marketing-focused Next.js site rather than a complete ordering system.

## 1.1 Locked Architecture Decisions

- Admin-only authentication for the dashboard
- No customer login or customer account system
- Guest checkout only for the storefront
- Customer data stored as order/contact records in a dedicated `Customer` table
- Prisma used as the primary schema and query layer
- Supabase used as hosted PostgreSQL

## 2. Product Scope

### Customer Features

- Responsive storefront for mobile and desktop
- Menu browsing by category
- Product detail and customization options
- Cart with quantity updates and price totals
- Pickup and delivery checkout flows
- Coupon code support
- Secure online payment
- Order confirmation screen and email
- Basic order tracking for status changes
- WhatsApp cart/order summary sharing
- Downloadable PDF menu

### Admin Features

- Admin authentication and role-based access
- Dashboard for orders, revenue summary, and top products
- Menu, category, and product availability management
- Coupon management
- Customer order history
- Order status updates with internal notes
- Printable receipts/invoices
- Up to 3 admin accounts

## 3. Recommended Technical Architecture

### Frontend

- Next.js App Router
- Server Components for menu and product pages
- Client Components only where interaction is required
- Tailwind CSS for UI styling
- Zustand for cart and small client-side state

### Backend

- Next.js Route Handlers or Server Actions for internal workflows
- Prisma as the only ORM/data layer
- PostgreSQL database
- Admin-only authentication for `/admin`
- No customer login or customer account system at launch
- Webhook handling for payment confirmation
- Transactional email provider for confirmations

### Infrastructure

- Vercel for app hosting
- Supabase Postgres as the managed database
- Preferred option: Supabase used as the Postgres host, with Prisma managing schema and queries
- Object storage for product images if needed

## 4. Core Data Model With Prisma

The initial Prisma schema should cover these entities:

- `AdminUser`
  - dashboard users only
  - fields: `id`, `email`, `name`, `phone`, `role`, `passwordHash`, `createdAt`
- `Customer`
  - guest customer profile built from order/contact data
  - fields: `id`, `name`, `email`, `phone`, `marketingOptIn`, `createdAt`
- `Address`
  - saved customer delivery addresses
  - fields: `id`, `customerId`, `label`, `street`, `city`, `postalCode`, `notes`
- `Category`
  - menu grouping such as coffee, breakfast, desserts
  - fields: `id`, `name`, `slug`, `sortOrder`, `isActive`
- `Product`
  - menu item
  - fields: `id`, `categoryId`, `name`, `slug`, `description`, `price`, `imageUrl`, `isActive`, `isAvailable`, `sku`
- `ProductOptionGroup`
  - option sets such as size, milk choice, add-ons
- `ProductOption`
  - individual choices with optional price delta
- `Cart`
  - active shopping cart
- `CartItem`
  - selected product, qty, selected options, unit price snapshot
- `Order`
  - fields: `id`, `orderNumber`, `customerId`, `status`, `fulfillmentType`, `paymentStatus`, `subtotal`, `discountTotal`, `deliveryFee`, `taxTotal`, `grandTotal`, `notes`
- `OrderItem`
  - order line snapshots
- `Coupon`
  - code, discount type, amount, min order, start/end dates, usage rules
- `Payment`
  - gateway payment intent/reference data
- `Notification`
  - order event logs and admin alerts
- `AuditLog`
  - admin changes for products, coupons, and order statuses

### Important Modeling Notes

- Keep `OrderItem` and option prices as snapshots so historical orders stay correct even if menu prices change later.
- Treat inventory as `availability control`, not full stock forecasting, because the proposal includes item availability but excludes full inventory system scope.
- Use enum types for `adminRole`, `orderStatus`, `paymentStatus`, and `fulfillmentType`.
- Customers check out as guests; customer records are created from order/contact information, not from a login system.

## 5. Functional Modules

### Phase A: Foundation

- Project structure cleanup
- Environment variable strategy
- Prisma setup and initial migrations
- Database seed script for categories and starter products
- Auth setup for admins only

### Phase B: Storefront

- Home page refinement from current marketing page
- Menu listing page
- Category filters and search
- Product detail modal/page
- Cart sidebar/page
- WhatsApp share action
- PDF menu download page

### Phase C: Checkout and Orders

- Pickup vs delivery selection
- Delivery fee rules
- Contact and address capture
- Coupon application
- Payment integration
- Order creation transaction
- Confirmation page and email

### Phase D: Admin Dashboard

- Login and protected routes
- Orders list and detail page
- Status update workflow
- Menu/category CRUD
- Availability toggle
- Coupon CRUD
- Basic analytics widgets
- Printable receipt layout

### Phase E: Operations and Quality

- Order status notifications
- SEO metadata and sitemap
- Error monitoring
- Test coverage for critical flows
- Launch checklist and handover docs

## 6. Proposed Route Map

### Public

- `/`
- `/menu`
- `/menu/[category]`
- `/product/[slug]`
- `/cart`
- `/checkout`
- `/order/[orderNumber]`
- `/menu.pdf` or `/api/menu/pdf`

### Admin

- `/admin/login`
- `/admin`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/products`
- `/admin/categories`
- `/admin/coupons`
- `/admin/customers`
- `/admin/reports`

### API / Server Endpoints

- `/api/cart`
- `/api/checkout`
- `/api/payments/webhook`
- `/api/orders/status`
- `/api/whatsapp/share`
- `/api/admin/products`
- `/api/admin/coupons`

## 7. Delivery Plan By Week

### Week 1: Discovery and Foundation

- Finalize requirements from menu, pricing, delivery areas, payment provider
- Confirm admin roles and dashboard access rules
- Set up Prisma, Supabase Postgres connection, migrations, and seed data
- Define the final schema and ERD
- Establish app folders, shared UI primitives, and coding conventions

### Week 2: Storefront UI

- Convert the current landing page into a commerce-ready storefront
- Build menu browsing, categories, product cards, and product detail interactions
- Implement cart state and pricing calculations
- Complete responsive layouts for mobile-first ordering

### Week 3: Checkout and Order Creation

- Build checkout forms for pickup and delivery
- Add coupon logic and delivery fee calculation
- Create order persistence with Prisma transactions
- Add confirmation page and confirmation email templates

### Week 4: Payment and Tracking

- Integrate payment provider
- Implement payment webhook handling and status reconciliation
- Build customer order tracking page
- Add WhatsApp cart/order sharing

### Week 5: Admin Dashboard

- Add admin authentication and route protection
- Build order management views and filters
- Add product/category CRUD and availability toggles
- Add coupon management and basic sales metrics

### Week 6: Hardening and Launch

- Test full user flows
- Fix edge cases and data issues
- Add SEO metadata, sitemap, and robots rules
- Create handover docs, admin guide, and launch checklist
- Deploy production build and validate monitoring

## 8. Priority Backlog

### Must Have for MVP

- Product catalog
- Cart
- Checkout
- Payment
- Pickup/delivery selection
- Order persistence
- Admin order management
- Product availability management
- Confirmation email

### Should Have

- Coupons
- Order tracking
- Customer history
- Printable receipt
- WhatsApp sharing

### Could Have After Launch

- Loyalty points
- Saved favorites
- Multi-language support
- Scheduled orders
- Subscription coffee orders
- Advanced analytics dashboard

## 9. Key Technical Decisions

### Database

- Use `PostgreSQL` with Prisma migrations
- Keep a dedicated `prisma/seed.ts`
- Use decimal-safe price fields and avoid floating point amounts

### Authentication

- Minimum launch requirement: admin auth
- No customer auth or customer login in the initial release
- Customer identity is captured only through checkout/order data

### Payments

- Prefer hosted checkout or payment intents depending on UX preference
- Store gateway references in a `Payment` table
- Never treat client-side success as final without webhook confirmation

### Images and Files

- Product images stored in managed object storage
- Generated receipt and PDF menu can be rendered server-side

## 10. Testing Strategy

### Unit Tests

- price calculation
- coupon validation
- delivery fee logic
- order status transitions

### Integration Tests

- checkout submission
- payment webhook updates
- admin product CRUD
- admin order status updates

### Manual UAT

- mobile ordering flow
- failed payment recovery
- unavailable item handling
- order confirmation email
- receipt printing

## 11. Risks and Mitigations

- `Scope creep`: lock MVP features before week 2 and defer non-essential items
- `Data inconsistency`: use Prisma transactions for checkout and order creation
- `Payment mismatch`: rely on webhook-driven payment finalization
- `Menu content delays`: require menu data and images before storefront completion
- `Operational confusion`: define order statuses and admin workflow early

## 12. Immediate Build Order For This Repository

Given the current codebase state, the best implementation order is:

1. Add Prisma, database config, migrations, and seed data
2. Introduce shared commerce domain types and utilities
3. Build `/menu`, `/cart`, and `/checkout`
4. Connect checkout to Prisma-backed `Order` creation
5. Add payment integration and webhook handling
6. Add `/admin` dashboard and order management
7. Add coupon system, tracking, and reporting

## 13. Definition of Done

The project is ready for launch when:

- customers can browse products and place a paid order end-to-end
- admins can manage menu items and order statuses
- order emails and payment reconciliation work reliably
- mobile checkout is usable without layout issues
- production environment variables, backups, and monitoring are configured
- handover documentation is complete

## 14. Recommended Next Steps

- Approve the MVP scope and confirm payment provider
- Confirm the admin roles needed for the dashboard
- Confirm whether admin login will use Supabase Auth or an in-app credential flow
- Start with Prisma schema design for admin auth plus guest checkout data, and a seeded demo menu so UI and backend can move in parallel
