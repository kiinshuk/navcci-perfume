"""Razorpay integration service."""
from __future__ import annotations

import hashlib
import hmac
import logging
from decimal import Decimal

import razorpay
from django.conf import settings

from apps.orders.models import Order
from apps.orders.services import mark_order_status

logger = logging.getLogger("navcci.payments")


_PLACEHOLDER_KEYS = {"", "rzp_test_placeholder", "rzp_live_placeholder", "local_secret"}


def razorpay_is_configured() -> bool:
    """Return True if real Razorpay credentials are present."""
    return (
        settings.RAZORPAY_KEY_ID not in _PLACEHOLDER_KEYS
        and settings.RAZORPAY_KEY_SECRET not in _PLACEHOLDER_KEYS
    )


def get_razorpay_client() -> razorpay.Client:
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def create_razorpay_order(order: Order) -> dict:
    """Create a Razorpay order for the given Luxe Order.

    When Razorpay credentials are placeholders (local dev / staging) we skip the
    real API call and return a synthetic order object so the checkout flow can
    continue end-to-end. Production deployments must set real keys.
    """
    if order.razorpay_order_id:
        return {
            "id": order.razorpay_order_id,
            "amount": int(order.total * Decimal("100")),
            "currency": order.currency,
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_number": order.order_number,
        }

    amount_paise = int(order.total * Decimal("100"))

    if not razorpay_is_configured():
        synthetic_id = f"local_{order.order_number}"
        order.razorpay_order_id = synthetic_id
        order.save(update_fields=["razorpay_order_id"])
        logger.warning(
            "Razorpay keys are placeholders — using synthetic order %s for %s",
            synthetic_id,
            order.order_number,
        )
        return {
            "id": synthetic_id,
            "amount": amount_paise,
            "currency": order.currency,
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_number": order.order_number,
        }

    client = get_razorpay_client()
    payload = {
        "amount": amount_paise,
        "currency": order.currency,
        "receipt": order.order_number,
        "notes": {
            "order_number": order.order_number,
            "user_id": str(order.user_id),
            "email": order.email,
        },
    }
    try:
        rz_order = client.order.create(payload)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Razorpay order creation failed: %s", exc)
        raise

    order.razorpay_order_id = rz_order["id"]
    order.save(update_fields=["razorpay_order_id"])
    return {
        "id": rz_order["id"],
        "amount": amount_paise,
        "currency": order.currency,
        "key_id": settings.RAZORPAY_KEY_ID,
        "order_number": order.order_number,
    }


def verify_razorpay_signature(order: Order, payment_id: str, signature: str) -> bool:
    body = f"{order.razorpay_order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        body.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def capture_payment(order: Order, payment_id: str, signature: str) -> Order:
    if not verify_razorpay_signature(order, payment_id, signature):
        raise ValueError("Invalid payment signature.")
    order.razorpay_payment_id = payment_id
    order.razorpay_signature = signature
    order.save(update_fields=["razorpay_payment_id", "razorpay_signature"])
    mark_order_status(order, Order.Status.PAID, note="Razorpay payment captured.")
    return order


def refund_payment(order: Order, amount: Decimal | None = None) -> dict:
    client = get_razorpay_client()
    payload = {"amount": int((amount or order.total) * Decimal("100"))}
    response = client.payment.refund(order.razorpay_payment_id, payload)
    mark_order_status(order, Order.Status.REFUNDED, note="Refund issued.")
    return response
