# Luxe Perfume — Backend

Django 5 + DRF API for the Luxe Perfume platform.

## Quick reference

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed
python manage.py runserver
```

- API: http://localhost:8000/api
- Swagger: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Admin: http://localhost:8000/admin

## Sample credentials (created by `seed`)

- Admin: `admin@luxeperfume.in` / `LuxeAdmin#2025`
- Customer: `demo@luxeperfume.in` / `LuxeDemo#2025`

## Apps

- `apps.core` — pagination, exceptions, middleware, throttling, renderers
- `apps.accounts` — custom user, JWT, OTP, addresses, wishlist
- `apps.catalog` — products, brands, categories, reviews
- `apps.orders` — cart, order lifecycle, coupons
- `apps.payments` — Razorpay capture & webhook

## Testing

```bash
pytest
```
