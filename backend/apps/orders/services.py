"""Order service layer — cart, checkout, and order lifecycle."""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from apps.catalog.models import Product
from apps.orders.models import Cart, CartItem, Coupon, Order, OrderItem, OrderTimeline


# ---------------------------------------------------------------------------
# Cart helpers
# ---------------------------------------------------------------------------
def get_or_create_cart(user=None, session_key: str | None = None) -> Cart:
    if user is not None and user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=user)
        # Merge anonymous cart
        if session_key:
            Cart.objects.filter(session_key=session_key, user__isnull=True).delete()
        return cart
    if session_key is None:
        import uuid
        session_key = uuid.uuid4().hex
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user__isnull=True)
    return cart


@transaction.atomic
def add_to_cart(cart: Cart, product_id: str, quantity: int = 1) -> CartItem:
    product = Product.objects.select_for_update().get(pk=product_id, is_active=True)
    if product.track_inventory and product.stock_quantity < quantity:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"quantity": "Insufficient stock."})

    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    item.quantity = quantity if created else min(item.quantity + quantity, 20)
    item.saved_for_later = False
    item.save()
    return item


@transaction.atomic
def update_cart_item(cart: Cart, item_id: str, quantity: int) -> CartItem:
    item = CartItem.objects.select_for_update().get(pk=item_id, cart=cart)
    product = Product.objects.select_for_update().get(pk=item.product_id)
    if product.track_inventory and product.stock_quantity < quantity:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"quantity": "Insufficient stock."})
    item.quantity = quantity
    item.save()
    return item


def remove_cart_item(cart: Cart, item_id: str) -> None:
    CartItem.objects.filter(cart=cart, pk=item_id).delete()


def save_for_later(cart: Cart, item_id: str, save: bool = True) -> CartItem:
    item = CartItem.objects.get(pk=item_id, cart=cart)
    item.saved_for_later = save
    item.save(update_fields=["saved_for_later"])
    return item


def move_to_cart(cart: Cart, item_id: str) -> CartItem:
    return save_for_later(cart, item_id, save=False)


def apply_coupon(cart: Cart, code: str) -> Coupon:
    code = (code or "").strip().upper()
    try:
        coupon = Coupon.objects.get(code=code, is_active=True)
    except Coupon.DoesNotExist as exc:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"code": "Invalid coupon code."}) from exc

    valid, message = coupon.is_valid(user=cart.user, cart_total=cart.subtotal)
    if not valid:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"code": message})
    cart.coupon = coupon
    cart.save(update_fields=["coupon"])
    return coupon


def remove_coupon(cart: Cart) -> None:
    cart.coupon = None
    cart.save(update_fields=["coupon"])


# ---------------------------------------------------------------------------
# Order creation
# ---------------------------------------------------------------------------
@transaction.atomic
def create_order_from_cart(cart: Cart, checkout_data: dict, user) -> Order:
    if cart.item_count == 0:
        from rest_framework.exceptions import ValidationError
        raise ValidationError({"cart": "Cart is empty."})

    items = list(cart.items.select_related("product").filter(saved_for_later=False))
    for item in items:
        if item.product.track_inventory and item.product.stock_quantity < item.quantity:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"stock": f"{item.product.name} is out of stock."})

    order = Order.objects.create(
        user=user,
        email=user.email,
        phone=checkout_data["shipping_phone"],
        shipping_full_name=checkout_data["shipping_full_name"],
        shipping_phone=checkout_data["shipping_phone"],
        shipping_line1=checkout_data["shipping_line1"],
        shipping_line2=checkout_data.get("shipping_line2", ""),
        shipping_city=checkout_data["shipping_city"],
        shipping_state=checkout_data["shipping_state"],
        shipping_postal_code=checkout_data["shipping_postal_code"],
        shipping_country=checkout_data.get("shipping_country", "IN"),
        billing_same_as_shipping=checkout_data.get("billing_same_as_shipping", True),
        notes=checkout_data.get("notes", ""),
        subtotal=cart.subtotal,
        discount=cart.discount,
        shipping_cost=cart.shipping,
        tax=Decimal("0.00"),
        total=cart.total,
    )

    if not order.billing_same_as_shipping:
        for field in ("billing_full_name", "billing_line1", "billing_city", "billing_state", "billing_postal_code"):
            setattr(order, field, checkout_data.get(field, ""))

    for item in items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            unit_price=item.unit_price,
            quantity=item.quantity,
        )
        if item.product.track_inventory:
            Product.objects.filter(pk=item.product_id).update(
                stock_quantity=item.product.stock_quantity - item.quantity,
                sales_count=item.product.sales_count + item.quantity,
            )
        else:
            Product.objects.filter(pk=item.product_id).update(
                sales_count=item.product.sales_count + item.quantity,
            )

    if cart.coupon:
        from apps.orders.models import CouponRedemption
        CouponRedemption.objects.create(coupon=cart.coupon, user=user, order=order)
        Coupon.objects.filter(pk=cart.coupon_id).update(usage_count=cart.coupon.usage_count + 1)

    OrderTimeline.objects.create(order=order, status=Order.Status.PENDING, note="Order created.")

    # Empty the cart
    cart.items.filter(saved_for_later=False).delete()
    cart.coupon = None
    cart.save(update_fields=["coupon"])

    order.save()
    return order


def mark_order_status(order: Order, status_value: str, note: str = "") -> Order:
    order.status = status_value
    if status_value == Order.Status.PAID:
        order.payment_status = Order.PaymentStatus.PAID
        order.paid_at = timezone.now()
    elif status_value == Order.Status.CANCELLED:
        order.cancelled_at = timezone.now()
    elif status_value == Order.Status.DELIVERED:
        order.delivered_at = timezone.now()
    order.save()
    OrderTimeline.objects.create(order=order, status=status_value, note=note)
    return order
