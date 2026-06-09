# Production Checklist

## Pre-deploy

- [ ] `SECRET_KEY` and `REVALIDATE_SECRET` regenerated and stored in vault
- [ ] `DEBUG=False`, `ENVIRONMENT=production`
- [ ] `ALLOWED_HOSTS` set to production domains
- [ ] `CORS_ALLOWED_ORIGINS` set to `https://luxeperfume.in,https://www.luxeperfume.in`
- [ ] Database password rotated and stored in vault
- [ ] S3 / R2 credentials scoped to a single bucket
- [ ] Razorpay live keys configured
- [ ] Razorpay webhook secret rotated and URL configured
- [ ] SMTP credentials scoped to sending only
- [ ] Sentry DSN configured
- [ ] Uptime monitor on `/api/health/`

## Application

- [ ] `python manage.py migrate` runs cleanly
- [ ] `python manage.py collectstatic --noinput` runs cleanly
- [ ] `python manage.py seed` executed with curated content
- [ ] Admin superuser created with strong password
- [ ] Admin URL changed from default `admin/`
- [ ] Email templates verified end-to-end
- [ ] Razorpay test mode replaced with live keys
- [ ] Coupon expiry & usage limits reviewed

## Infrastructure

- [ ] HTTPS via Cloudflare Full (Strict) or Let's Encrypt
- [ ] HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy in nginx
- [ ] nginx rate limits in place
- [ ] UFW allows 22, 80, 443 only
- [ ] fail2ban running
- [ ] unattended-upgrades enabled
- [ ] Daily Postgres backup to offsite storage
- [ ] Logrotate configured for Docker logs
- [ ] Disk monitoring and alerting

## Frontend

- [ ] Lighthouse Performance ≥ 90 (home, shop, PDP)
- [ ] LCP ≤ 2.5s on 4G
- [ ] CLS ≤ 0.05
- [ ] All pages have unique title/description
- [ ] OpenGraph image present for all pages
- [ ] sitemap.xml reachable at /sitemap.xml
- [ ] robots.txt present
- [ ] JSON-LD Product schema on PDP
- [ ] 404 / 500 pages styled
- [ ] Forms validated with Zod
- [ ] Cart persists in localStorage and syncs after login

## Security

- [ ] Argon2 password hashing
- [ ] JWT access tokens ≤ 60 min
- [ ] Refresh token rotation + blacklisting on logout
- [ ] CSRF tokens on cookie-auth endpoints
- [ ] CSP / HSTS in nginx
- [ ] SQL injection prevented (ORM only)
- [ ] XSS prevented (no `dangerouslySetInnerHTML` without sanitization)
- [ ] File upload validation (MIME, size, dimensions)
- [ ] Razorpay signature verification on capture + webhook
- [ ] Webhook idempotency (mark events processed)
- [ ] Logging scrubbed of PII / payment data

## Post-launch (first 7 days)

- [ ] Monitor Sentry for new errors
- [ ] Monitor Razorpay dashboard for failed payments
- [ ] Verify transactional emails (order, shipping, delivered)
- [ ] Check conversion funnel analytics
- [ ] Verify backup restoration procedure
