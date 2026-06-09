# Environment Variables

All variables live in `.env` (see `.env.example`).

## Backend (Django)

| Var | Required | Description |
|---|---|---|
| `SECRET_KEY` | yes | 50+ char random string |
| `DEBUG` | no | `False` in production |
| `ALLOWED_HOSTS` | yes | Comma-separated |
| `ENVIRONMENT` | no | `production` / `staging` |
| `POSTGRES_*` | yes | DB connection |
| `REDIS_URL` | yes | redis://host:6379/0 |
| `JWT_ACCESS_LIFETIME_MIN` | no | Default 60 |
| `JWT_REFRESH_LIFETIME_DAYS` | no | Default 14 |
| `EMAIL_*` | yes | SMTP credentials |
| `AWS_*` | when USE_S3 | Cloudflare R2 / S3 |
| `RAZORPAY_KEY_ID` / `_SECRET` | yes | Payments |
| `RAZORPAY_WEBHOOK_SECRET` | yes | Webhook signature |
| `CORS_ALLOWED_ORIGINS` | yes | Comma-separated |
| `SENTRY_DSN` | no | Error monitoring |

## Frontend (Next.js)

| Var | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | e.g. `https://api.luxeperfume.in/api` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | yes | Razorpay key |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical site URL |
| `NEXT_PUBLIC_SITE_NAME` | no | Display name |
| `NEXT_PUBLIC_CDN_URL` | yes | Media CDN base |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | no | Country-code prefix |
| `REVALIDATE_SECRET` | yes | On-demand revalidation |

## Generating secrets

```bash
openssl rand -hex 32  # SECRET_KEY / REVALIDATE_SECRET
```
