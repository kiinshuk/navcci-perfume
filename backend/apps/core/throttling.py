"""Custom throttle classes for sensitive endpoints."""
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class BurstRateThrottle(UserRateThrottle):
    scope = "burst"


class CheckoutRateThrottle(UserRateThrottle):
    scope = "checkout"


class AuthRateThrottle(AnonRateThrottle):
    scope = "auth"
