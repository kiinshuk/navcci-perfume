# Luxe Perfume — Frontend

Next.js 15 storefront + admin dashboard.

## Quick reference

```bash
npm install
cp .env.example .env.local
npm run dev
```

App will be available at http://localhost:3000.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run format` | Prettier |

## Structure

```
app/                    # App Router pages
  (public)              # Public storefront
  auth/                 # Sign in / register / reset
  account/              # Member area
  admin/                # Staff / admin dashboard
components/             # Reusable UI
  ui/                   # Shadcn-style primitives
  layout/               # Header, footer, marquee
  product/              # Cards, gallery, buy box, filters
  home/                 # Hero, sections
  cart/                 # Cart drawer, actions
  checkout/             # Checkout form
  account/              # Sidebar
  contact/              # Contact form
lib/                    # API client, services, utils
store/                  # Zustand stores (auth, cart, ui)
hooks/                  # Custom React hooks
types/                  # Shared TypeScript types
styles/                 # Tailwind & globals
```
