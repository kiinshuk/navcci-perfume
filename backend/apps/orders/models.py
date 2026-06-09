"""Order domain models: Cart, Order, OrderItem, Coupon, OrderTimeline."""
from __future__ import annotations

import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from apps.core.mixins import TimestampedModel


class Coupon(TimestampedModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage"
        FIXED = "fixed", "Fixed Amount"
        FREE_SHIPPING = "free_shipping", "Free Shipping"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=32, unique=True, db_index=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.DecimalField(
        max_digits=12, decimal_places=2,
        help_text="Percent (0-100) when percentage, or flat amount when fixed",
    )
    min_order_value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    max_discount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    usage_limit_per_user = models.PositiveIntegerField(default=1)
    usage_count = models.PositiveIntegerField(default=0)
    starts_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.code

    def is_valid(self, user=None, cart_total: Decimal = Decimal("0")) -> tuple[bool, str]:
        now = timezone.now()
        if not self.is_active:
            return False, "Coupon is inactive."
        if not (self.starts_at <= now <= self.expires_at):
            return False, "Coupon is not within its validity period."
        if self.usage_limit and self.usage_count >= self.usage_limit:
            return False, "Coupon usage limit reached."
        if cart_total < self.min_order_value:
            return False, f"Minimum order value is {self.min_order_value}."
        if user and self.usage_limit_per_user:
            used = CouponRedemption.objects.filter(coupon=self, user=user).count()
            if used >= self.usage_limit_per_user:
                return False, "You have already redeemed this coupon."
        return True, "ok"

    def calculate_discount(self, cart_total: Decimal, shipping: Decimal) -> Decimal:
        if self.discount_type == self.DiscountType.PERCENTAGE:
            discount = cart_total * (self.discount_value / Decimal("100"))
            if self.max_discount:
                discount = min(discount, self.max_discount)
            return discount.quantize(Decimal("0.01"))
        if self.discount_type == self.DiscountType.FIXED:
            return min(self.discount_value, cart_total).quantize(Decimal("0.01"))
        if self.discount_type == self.DiscountType.FREE_SHIPPING:
            return min(shipping, shipping).quantize(Decimal("0.01"))
        return Decimal("0.00")


class CouponRedemption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE, related_name="redemptions")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coupon_redemptions")
    order = models.ForeignKey("Order", on_delete=models.SET_NULL, null=True, related_name="coupon_redemptions")
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["coupon", "user"])]


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------
class Cart(TimestampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True, related_name="cart"
    )
    session_key = models.CharField(max_length=64, db_index=True, null=True, blank=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name="carts")

    class Meta:
        ordering = ("-updated_at",)

    def __str__(self) -> str:
        return f"Cart({self.user or self.session_key})"

    @property
    def subtotal(self) -> Decimal:
        return sum((item.line_total for item in self.items.all()), Decimal("0.00"))

    @property
    def item_count(self) -> int:
        return sum((item.quantity for item in self.items.all()), 0)

    @property
    def shipping(self) -> Decimal:
        if self.subtotal >= Decimal("1500") or self.subtotal == 0:
            return Decimal("0.00")
        return Decimal("99.00")

    @property
    def discount(self) -> Decimal:
        if not self.coupon:
            return Decimal("0.00")
        return self.coupon.calculate_discount(self.subtotal, self.shipping)

    @property
    def total(self) -> Decimal:
        return max(self.subtotal - self.discount + self.shipping, Decimal("0.00"))


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1), MaxValueValidator(20)])
    saved_for_later = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("cart", "product")
        ordering = ("-added_at",)

    @property
    def unit_price(self) -> Decimal:
        return self.product.display_price

    @property
    def line_total(self) -> Decimal:
        return (self.unit_price * self.quantity).quantize(Decimal("0.01"))


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class Order(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        OUT_FOR_DELIVERY = "out_for_delivery", "Out for Delivery"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=24, unique=True, db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING, db_index=True)
    payment_status = models.CharField(max_length=24, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)

    email = models.EmailField()
    phone = models.CharField(max_length=20)

    shipping_full_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_line1 = models.CharField(max_length=255)
    shipping_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=80)
    shipping_state = models.CharField(max_length=80)
    shipping_postal_code = models.CharField(max_length=12)
    shipping_country = models.CharField(max_length=2, default="IN")

    billing_same_as_shipping = models.BooleanField(default=True)
    billing_full_name = models.CharField(max_length=150, blank=True)
    billing_line1 = models.CharField(max_length=255, blank=True)
    billing_city = models.CharField(max_length=80, blank=True)
    billing_state = models.CharField(max_length=80, blank=True)
    billing_postal_code = models.CharField(max_length=12, blank=True)
    billing_country = models.CharField(max_length=2, default="IN")

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="INR")

    notes = models.TextField(blank=True)
    tracking_number = models.CharField(max_length=120, blank=True)
    tracking_url = models.URLField(blank=True)
    courier = models.CharField(max_length=80, blank=True)

    razorpay_order_id = models.CharField(max_length=64, blank=True, db_index=True)
    razorpay_payment_id = models.CharField(max_length=64, blank=True)
    razorpay_signature = models.CharField(max_length=256, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_order_number() -> str:
        return f"LX-{timezone.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey("catalog.Product", on_delete=models.SET_NULL, null=True, related_name="order_items")
    product_name = models.CharField(max_length=200)
    product_sku = models.CharField(max_length=40)
    product_image = models.URLField(blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ("id",)

    def save(self, *args, **kwargs):
        if not self.product_name and self.product:
            self.product_name = self.product.name
            self.product_sku = self.product.sku
            primary = self.product.images.filter(is_primary=True).first() or self.product.images.first()
            if primary:
                self.product_image = primary.image.url
        if not self.line_total:
            self.line_total = (self.unit_price * self.quantity).quantize(Decimal("0.01"))
        super().save(*args, **kwargs)


class OrderTimeline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="timeline")
    status = models.CharField(max_length=24, choices=Order.Status.choices)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)
