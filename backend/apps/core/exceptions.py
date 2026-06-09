"""Custom exception handler with a consistent error envelope."""
from __future__ import annotations

import logging
import uuid

from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("luxe.errors")


def luxe_exception_handler(exc, context):
    """Wrap every error into {success, error: {code, message, details, request_id}}."""
    response = exception_handler(exc, context)

    request = context.get("request")
    request_id = getattr(request, "request_id", str(uuid.uuid4()))

    if isinstance(exc, APIException):
        code = exc.default_code
        message = exc.detail if isinstance(exc.detail, str) else exc.default_detail
    else:
        code = "internal_error"
        message = "An unexpected error occurred. Please try again."
        logger.exception("Unhandled error: %s", exc)

    payload = {
        "success": False,
        "error": {
            "code": code,
            "message": str(message),
            "request_id": request_id,
        },
    }

    if response is not None and isinstance(response.data, dict) and settings.DEBUG:
        # In development, expose field-level serializer errors for easier debugging.
        payload["error"]["details"] = response.data

    if response is None:
        return Response(payload, status=500)
    response.data = payload
    return response
