# Navcci Perfume — Luxury E-commerce Platform

Production-grade monorepo for a luxury perfume brand.

## Stack

- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind · Shadcn UI · React Query · Zustand
- **Backend:** Django 5 · DRF · SimpleJWT · PostgreSQL · Redis
- **Infra:** Docker · Docker Compose · Nginx · Gunicorn · Cloudflare compatible
- **Payments:** Razorpay

## Repository Layout

```
navcci-perfume/
├── backend/                # Django REST API
│   ├── config/             # Settings, URLs, ASGI/WSGI
│   ├── apps/
│   │   ├── accounts/       # User, profile, address
│   │   ├── catalog/        # Product, Category, Brand, Review
│   │   ├── orders/         # Cart, Order, Coupon
│   │   ├── payments/       # Razorpay integration
│   │   └── core/           # Shared utilities, middleware
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js 15 storefront + admin
│   ├── app/                # App Router pages
│   ├── components/         # Reusable UI
│   ├── lib/                # API client, utils
│   ├── store/              # Zustand stores
│   └── Dockerfile
├── infra/
│   ├── nginx/              # Reverse proxy + SSL
│   └── postgres/           # Init scripts
├── docs/                   # Architecture, API, deployment
├── postman/                # Postman collection
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start

```bash
git clone <repo>
cd navcci-perfume
cp .env.example .env
docker compose up -d --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin
- API: http://localhost:8000/api
- API Docs: http://localhost:8000/api/docs

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Production Checklist](docs/PRODUCTION_CHECKLIST.md)
- [Environment Variables](docs/ENVIRONMENT.md)

## License

Proprietary — © Navcci Perfume.
