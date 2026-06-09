"""Local host-only settings — SQLite, in-memory cache, console email.
Used when running the API directly on a developer machine (no Docker).
Production must use `config.settings` with PostgreSQL + Redis + R2/S3.
"""
from .settings import *  # noqa: F401,F403

import os

DEBUG = True
ALLOWED_HOSTS = ["*"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "navcci-local",
    }
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
CORS_ALLOW_ALL_ORIGINS = True
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
HSTS_SECONDS = 0
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
AXES_ENABLED = False
RAZORPAY_KEY_ID = "rzp_test_local"
RAZORPAY_KEY_SECRET = "local_secret"
RAZORPAY_WEBHOOK_SECRET = "local_webhook_secret"
USE_S3 = False
USE_TZ = True
