"""Order serializers."""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product
from apps.orders.models import Cart, CartItem, Coupon, Order, OrderItem, OrderTimeline


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = (
            "id",
            "code",
            "description",
            "discount_type",
            "discount_value",
            "min_order_value",
            "max_discount",
            "starts_at",
            "expires_at",
            "is_active",
        )
        read_only_fields = ("id",)


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_slug = serializers.CharField(source="product.slug", read_only=True)
    product_image = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    in_stock = serializers.BooleanField(source="product.is_in_stock", read_only=True)

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_slug",
            "product_image",
            "quantity",
            "unit_price",
            "line_total",
            "saved_for_later",
            "in_stock",
            "added_at",
        )
        read_only_fields = ("id", "added_at")

    def get_product_image(self, obj):
        primary = obj.product.images.filter(is_primary=True).first() or obj.product.images.first()
        return primary.image.url if primary and primary.image else None

    def validate_quantity(self, value: int) -> int:
        if value < 1 or value > 20:
            raise serializers.ValidationError("Quantity must be between 1 and 20.")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    shipping = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    coupon = CouponSerializer(read_only=True)

    class Meta:
        model = Cart
        fields = (
            "id",
            "items",
            "coupon",
            "subtotal",
            "discount",
            "shipping",
            "total",
            "item_count",
            "updated_at",
        )


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1, max_value=20, default=1)

    def validate_product_id(self, value):
        if not Product.objects.filter(pk=value, is_active=True).exists():
            raise serializers.ValidationError("Product not found.")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=20)


class ApplyCouponSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=32)


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_sku",
            "product_image",
            "unit_price",
            "quantity",
            "line_total",
        )


class OrderTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimeline
        fields = ("id", "status", "note", "created_at")


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "order_number",
            "status",
            "status_display",
            "payment_status",
            "email",
            "phone",
            "shipping_full_name",
            "shipping_phone",
            "shipping_line1",
            "shipping_line2",
            "shipping_city",
            "shipping_state",
            "shipping_postal_code",
            "shipping_country",
            "billing_same_as_shipping",
            "billing_full_name",
            "billing_line1",
            "billing_city",
            "billing_state",
            "billing_postal_code",
            "billing_country",
            "subtotal",
            "discount",
            "shipping_cost",
            "tax",
            "total",
            "currency",
            "notes",
            "tracking_number",
            "tracking_url",
            "courier",
            "razorpay_order_id",
            "paid_at",
            "cancelled_at",
            "delivered_at",
            "created_at",
            "items",
            "timeline",
        )
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    shipping_full_name = serializers.CharField(max_length=150)
    shipping_phone = serializers.CharField(max_length=20)
    shipping_line1 = serializers.CharField(max_length=255)
    shipping_line2 = serializers.CharField(max_length=255, required=False, allow_blank=True)
    shipping_city = serializers.CharField(max_length=80)
    shipping_state = serializers.CharField(max_length=80)
    shipping_postal_code = serializers.CharField(max_length=12)
    shipping_country = serializers.CharField(max_length=2, default="IN")
    billing_same_as_shipping = serializers.BooleanField(default=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True, max_length=32)
