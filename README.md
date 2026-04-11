# CAFIO

CAFIO is a coffee shop e-commerce storefront and admin dashboard built with `Next.js`, `Prisma`, and `Supabase Postgres`.

## Architecture

- Public storefront with guest checkout
- No customer login or customer account system
- Admin-only authentication for `/admin`
- Prisma-managed PostgreSQL schema
- Supabase as the hosted Postgres database

## Current Domain Model

- `AdminUser`: dashboard users only
- `Customer`: guest customer records created from checkout/order data
- `Category`, `Product`, `ProductOptionGroup`, `ProductOption`
- `Cart`, `CartItem`, `CartItemOption`
- `Order`, `OrderItem`, `OrderItemOption`
- `Coupon`, `CouponRedemption`
- `Payment`
- `Notification`
- `AuditLog`

The canonical schema is in [prisma/schema.prisma](/Users/jithinjacob/Desktop/le_cafio/prisma/schema.prisma).

## Stack

- `Next.js`
- `React`
- `Tailwind CSS`
- `Prisma ORM`
- `Supabase Postgres`
- `Vercel`

## Auth Model

- Admin users can sign in to the dashboard
- Customers do not sign in
- Customer identity is captured through checkout fields and stored in the `Customer` table

## Database Migrations

This repo currently uses a baseline-plus-upgrade migration flow because the live Supabase schema already existed before the current Prisma migration chain.

Current migration sequence:

- [prisma/migrations/20260317000000_baseline_live_schema/migration.sql](/Users/jithinjacob/Desktop/le_cafio/prisma/migrations/20260317000000_baseline_live_schema/migration.sql)
- [prisma/migrations/20260317001000_admin_dashboard_auth_only/migration.sql](/Users/jithinjacob/Desktop/le_cafio/prisma/migrations/20260317001000_admin_dashboard_auth_only/migration.sql)

If the live database already contains the baseline schema, use:

```bash
npx prisma migrate resolve --applied 20260317000000_baseline_live_schema
npx prisma migrate deploy
```

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Validate the Prisma schema:

```bash
npx prisma validate
```

## Project Docs

- [docs/project-development-plan.md](/Users/jithinjacob/Desktop/le_cafio/docs/project-development-plan.md)
- [prisma/schema.prisma](/Users/jithinjacob/Desktop/le_cafio/prisma/schema.prisma)
- [prisma.config.ts](/Users/jithinjacob/Desktop/le_cafio/prisma.config.ts)
