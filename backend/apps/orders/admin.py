from django.contrib import admin

from apps.orders.models import Coupon, CouponRedemption, Order, OrderItem, OrderTimeline


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_sku", "unit_price", "quantity", "line_total")
    can_delete = False


class OrderTimelineInline(admin.TabularInline):
    model = OrderTimeline
    extra = 0
    readonly_fields = ("status", "note", "created_at")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "payment_status",
        "total",
        "created_at",
    )
    list_filter = ("status", "payment_status", "created_at")
    search_fields = ("order_number", "email", "phone", "user__email", "tracking_number")
    readonly_fields = ("order_number", "razorpay_order_id", "razorpay_payment_id", "created_at", "updated_at")
    inlines = [OrderItemInline, OrderTimelineInline]


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "discount_type", "discount_value", "usage_count", "expires_at", "is_active")
    list_filter = ("discount_type", "is_active")
    search_fields = ("code",)


admin.site.register(CouponRedemption)
