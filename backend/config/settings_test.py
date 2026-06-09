"""Test settings — uses SQLite + in-memory cache for fast unit tests."""
from .settings import *  # noqa

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
    }
}

RAZORPAY_KEY_ID = "rzp_test_xxx"
RAZORPAY_KEY_SECRET = "test_secret"
RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret"

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
