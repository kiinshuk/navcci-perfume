# API Reference

Base URL (production): `https://api.luxeperfume.in/api`
OpenAPI/Swagger: `https://api.luxeperfume.in/api/docs/`
ReDoc: `https://api.luxeperfume.in/api/redoc/`

All responses follow the envelope:

```json
{
  "Success": true,
  "Data": { /* … */ }
}
```

Errors:

```json
{
  "Success": false,
  "Error": {
    "Code": "validation_error",
    "Message": "Invalid input.",
    "RequestId": "…"
  }
}
```

## Auth (`/api/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/register/` | Create account, returns `{ access, refresh, user }` |
| POST | `/login/` | `{ username, password }` → tokens |
| POST | `/logout/` | Blacklist refresh token |
| POST | `/token/refresh/` | Refresh access token |
| POST | `/password/reset/` | Request OTP by email |
| POST | `/password/reset/confirm/` | `{ email, otp, new_password }` |
| POST | `/password/change/` | (auth) change password |
| POST | `/email/verify/` | Verify email with OTP |
| GET / PATCH | `/profile/` | View / update profile |
| GET | `/wishlist/` | List wishlist |
| POST | `/wishlist/` | `{ product_id }` |
| DELETE | `/wishlist/` | `{ product_id }` |
| GET / POST / PATCH / DELETE | `/addresses/` | Address CRUD |
| POST | `/addresses/{id}/set_default/` | Mark default shipping |

## Catalog (`/api`)

| Method | Path | Description |
|---|---|---|
| GET | `/products/` | List, filter & search |
| GET | `/products/{slug}/` | Product detail |
| GET | `/products/featured/` | Featured |
| GET | `/products/bestsellers/` | Bestsellers |
| GET | `/products/new_arrivals/` | New arrivals |
| GET | `/search/?q=…` | Full-text search |
| GET | `/brands/` | List brands |
| GET | `/categories/` | Category tree (cached) |
| GET / POST | `/products/{slug}/reviews/` | List / create review |
| PATCH / DELETE | `/products/{slug}/reviews/{id}/` | Moderate own review |
| GET | `/catalog/stats/` | Admin stats |

### Product filters

`?min_price=`, `?max_price=`, `?brand=slug`, `?category=slug`, `?gender=`,
`?fragrance_family=`, `?concentration=`, `?min_rating=`, `?in_stock=true`,
`?is_featured=true`, `?is_bestseller=true`, `?is_new_arrival=true`,
`?notes=oud,rose`, `?ordering=-price`, `?search=…`, `?page=1`, `?page_size=24`

## Cart & Orders (`/api`)

| Method | Path | Description |
|---|---|---|
| GET / DELETE | `/cart/` | View / clear cart |
| POST | `/cart/items/` | Add item `{ product_id, quantity }` |
| PATCH | `/cart/items/{id}/` | Update quantity |
| DELETE | `/cart/items/{id}/` | Remove |
| POST | `/cart/items/{id}/save-for-later/` | Save for later |
| DELETE | `/cart/items/{id}/save-for-later/` | Move to cart |
| POST | `/cart/coupon/` | `{ code }` apply coupon |
| DELETE | `/cart/coupon/` | Remove coupon |
| POST | `/checkout/` | Create order + Razorpay order |
| GET | `/orders/` | My orders |
| GET | `/orders/{order_number}/` | Order detail |
| POST | `/orders/{order_number}/cancel/` | Cancel (admin) |
| POST | `/orders/{order_number}/ship/` | Mark shipped (admin) |
| POST | `/orders/{order_number}/deliver/` | Mark delivered (admin) |
| GET / POST / PATCH / DELETE | `/coupons/` | Coupon admin |
| GET | `/orders/stats/` | Admin analytics |

## Payments (`/api/payments`)

| Method | Path | Description |
|---|---|---|
| POST | `/capture/` | `{ order_id, payment_id, signature }` |
| POST | `/webhook/razorpay/` | Razorpay webhook |

## Rate limits

| Scope | Limit |
|---|---|
| Anonymous | 60 req / minute |
| Authenticated | 240 req / minute |
| Burst | 30 req / second |
| Auth (login/register) | 10 req / minute |
| Checkout | 10 req / minute |
