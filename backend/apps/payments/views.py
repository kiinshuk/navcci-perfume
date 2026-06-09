"""Payment views: capture and webhook handling."""
from __future__ import annotations

import json
import logging

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models import Order
from apps.payments.services import capture_payment, refund_payment

logger = logging.getLogger("luxe.payments")


class RazorpayCaptureView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "order_id": {"type": "string"},
                    "payment_id": {"type": "string"},
                    "signature": {"type": "string"},
                },
                "required": ["order_id", "payment_id", "signature"],
            }
        },
        responses={200: OpenApiResponse(description="Order marked paid.")},
    )
    def post(self, request):
        order_number = request.data.get("order_id")
        payment_id = request.data.get("payment_id")
        signature = request.data.get("signature")
        if not (order_number and payment_id and signature):
            return Response(
                {"success": False, "error": {"code": "missing_fields", "message": "Missing payment fields."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "not_found", "message": "Order not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            capture_payment(order, payment_id, signature)
        except ValueError as exc:
            return Response(
                {"success": False, "error": {"code": "invalid_signature", "message": str(exc)}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"success": True, "status": order.status})


@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def razorpay_webhook(request):
    """Verify and process Razorpay webhook events."""
    received_sig = request.META.get("HTTP_X_RAZORPAY_SIGNATURE", "")
    payload = request.body
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, received_sig):
        logger.warning("Razorpay webhook signature mismatch.")
        return HttpResponse(status=400)

    try:
        event = json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError:
        return HttpResponse(status=400)

    event_type = event.get("event")
    logger.info("Razorpay webhook: %s", event_type)

    if event_type in ("payment.captured", "order.paid"):
        order_entity = event.get("payload", {}).get("order", {}).get("entity", {}) or event.get("payload", {}).get(
            "payment", {}
        ).get("entity", {})
        receipt = order_entity.get("receipt")
        if receipt:
            try:
                order = Order.objects.get(order_number=receipt)
                if order.status != Order.Status.PAID:
                    mark_order_status(order, Order.Status.PAID, note="Webhook payment.captured")
            except Order.DoesNotExist:
                logger.warning("Webhook for unknown order: %s", receipt)
    return HttpResponse(status=200)


import hashlib
import hmac  # noqa: E402
