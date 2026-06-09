"""Custom middleware: request IDs and security headers."""
from __future__ import annotations

import uuid


class RequestIdMiddleware:
    HEADER = "HTTP_X_REQUEST_ID"

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.META.get(self.HEADER) or uuid.uuid4().hex
        response = self.get_response(request)
        response["X-Request-Id"] = request.request_id
        return response


class SecurityHeadersMiddleware:
    EXTRA = {
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        for header, value in self.EXTRA.items():
            response.setdefault(header, value)
        return response
