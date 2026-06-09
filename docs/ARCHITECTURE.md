# Architecture

## High-level overview

```
                       ┌────────────────────────────┐
                       │   Cloudflare (CDN / WAF)   │
                       └─────────────┬──────────────┘
                                     │
                              HTTPS  │
                       ┌─────────────▼──────────────┐
                       │   Nginx (TLS, rate limit)  │
                       └─────┬───────────────┬──────┘
                             │               │
                  /api/*     │               │   /*
                             ▼               ▼
                  ┌─────────────────┐   ┌──────────────┐
                  │ Django + DRF    │   │ Next.js 15   │
                  │ Gunicorn (3 w)  │   │ App Router   │
                  └────┬─────────┬──┘   └──────┬───────┘
                       │         │             │
                       │         │     SSR/RSC  │
                       │         │             │
                       ▼         ▼             ▼
                ┌──────────┐  ┌──────┐   ┌────────────┐
                │ Postgres │  │Redis │   │ CDN (R2)   │
                │   16     │  │ 7    │   │ Media      │
                └──────────┘  └──────┘   └────────────┘
                       ▲
                       │   async
                ┌──────┴───────┐
                │ Celery worker│
                └──────────────┘
```

## Backend — Django 5

- **Apps:** `accounts`, `catalog`, `orders`, `payments`, `core`.
- **Pattern:** Service layer for cart, checkout, coupon and order lifecycle.
- **Auth:** Custom `User` (email + username) with SimpleJWT. Refresh rotation, blacklist on logout.
- **Permissions:** Object-level for reviews (verified purchasers only) and orders.
- **Filtering:** `django-filter` with custom product filter (price, brand, gender, family, notes).
- **Pagination:** Envelope-style `LuxePagination` with `count / page / total_pages`.
- **Caching:** `django-redis` for categories tree, product detail hot path.
- **Search:** Postgres trigram + custom Q over notes JSON for relevance.
- **Background jobs:** Celery + Redis for email, exports, analytics aggregation.

## Frontend — Next.js 15

- **App Router** with RSC for SEO pages and Client Components for interactivity.
- **State:** React Query for server state; Zustand for cart & auth (with localStorage persistence).
- **UI:** Tailwind + Shadcn primitives (Button, Dialog, Tabs, etc.) tuned to a luxury palette (ink + gold).
- **Forms:** react-hook-form + Zod resolvers for type-safe validation.
- **Payments:** Razorpay JS SDK with server-side signature verification and webhook reconciliation.
- **Performance:** `next/image` with AVIF/WebP, route-segment caching, RSC streaming, edge-friendly headers.
- **SEO:** Dynamic metadata, OpenGraph, JSON-LD product schema, sitemap.xml, robots.txt, canonical URLs.

## Security

- Argon2 password hashing · JWT rotation · CORS allow-list · CSRF on cookie auth.
- Rate limiting (DRF throttles + nginx) — stricter on `/api/auth/login`.
- HSTS, X-Frame-Options DENY, secure cookies, request ID tracing.
- Razorpay signature verification on every capture and webhook.

## Performance budget

| Metric                        | Target |
|-------------------------------|--------|
| Lighthouse Performance        | ≥ 90   |
| LCP (4G)                      | ≤ 2.5s |
| CLS                           | ≤ 0.05 |
| TTFB (p99, cached)            | ≤ 200ms|
| Concurrent users (4 vCPU/8GB) | 500    |
| Products                      | 10,000+|
| Monthly visits                | 100k   |
