"""Orders API views."""
from __future__ import annotations

import logging

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders import services
from apps.orders.models import Coupon, Order
from apps.orders.serializers import (
    AddCartItemSerializer,
    ApplyCouponSerializer,
    CartSerializer,
    CheckoutSerializer,
    CouponSerializer,
    OrderSerializer,
    UpdateCartItemSerializer,
)
from apps.payments.services import create_razorpay_order

logger = logging.getLogger("luxe.orders")


def _cart_from_request(request):
    if request.user.is_authenticated:
        return services.get_or_create_cart(user=request.user, session_key=request.session.session_key)
    if not request.session.session_key:
        request.session.create()
    return services.get_or_create_cart(session_key=request.session.session_key)


# ---------------------------------------------------------------------------
# Cart
# ---------------------------------------------------------------------------
class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = _cart_from_request(request)
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart = _cart_from_request(request)
        cart.items.all().delete()
        cart.coupon = None
        cart.save(update_fields=["coupon"])
        return Response(CartSerializer(cart).data)


class CartItemView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=AddCartItemSerializer, responses=CartSerializer)
    def post(self, request):
        cart = _cart_from_request(request)
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.add_to_cart(
            cart,
            product_id=str(serializer.validated_data["product_id"]),
            quantity=serializer.validated_data["quantity"],
        )
        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=UpdateCartItemSerializer, responses=CartSerializer)
    def patch(self, request, item_id: str):
        cart = _cart_from_request(request)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.update_cart_item(cart, item_id, serializer.validated_data["quantity"])
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id: str):
        cart = _cart_from_request(request)
        services.remove_cart_item(cart, item_id)
        return Response(CartSerializer(cart).data)


class CartItemSaveForLaterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, item_id: str):
        cart = _cart_from_request(request)
        services.save_for_later(cart, item_id, save=True)
        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id: str):
        cart = _cart_from_request(request)
        services.move_to_cart(cart, item_id)
        return Response(CartSerializer(cart).data)


class ApplyCouponView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=ApplyCouponSerializer, responses=CartSerializer)
    def post(self, request):
        cart = _cart_from_request(request)
        if not request.user.is_authenticated:
            return Response(
                {"success": False, "error": {"code": "auth_required", "message": "Login to apply coupons."}},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = ApplyCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.apply_coupon(cart, serializer.validated_data["code"])
        return Response(CartSerializer(cart).data)

    def delete(self, request):
        cart = _cart_from_request(request)
        services.remove_coupon(cart)
        return Response(CartSerializer(cart).data)


# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------
class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=CheckoutSerializer, responses={201: OrderSerializer})
    def post(self, request):
        cart = _cart_from_request(request)
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = services.create_order_from_cart(
            cart=cart, checkout_data=serializer.validated_data, user=request.user
        )
        razorpay = create_razorpay_order(order)
        return Response(
            {
                "order": OrderSerializer(order).data,
                "razorpay": razorpay,
                "razorpay_key_id": razorpay.get("key_id"),
            },
            status=status.HTTP_201_CREATED,
        )


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
class OrderViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "order_number"

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related("items", "timeline")
        if user.is_staff:
            return qs
        return qs.filter(user=user)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def cancel(self, request, order_number: str = None):
        order = self.get_object()
        services.mark_order_status(order, Order.Status.CANCELLED, note="Cancelled by admin.")
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def ship(self, request, order_number: str = None):
        order = self.get_object()
        tracking = request.data.get("tracking_number", "")
        order.tracking_number = tracking
        order.save(update_fields=["tracking_number"])
        services.mark_order_status(order, Order.Status.SHIPPED, note=f"Tracking: {tracking}")
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def deliver(self, request, order_number: str = None):
        order = self.get_object()
        services.mark_order_status(order, Order.Status.DELIVERED, note="Delivered.")
        return Response(OrderSerializer(order).data)


# ---------------------------------------------------------------------------
# Coupons (admin)
# ---------------------------------------------------------------------------
class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by("-created_at")
    serializer_class = CouponSerializer
    permission_classes = [IsAdminUser]


# ---------------------------------------------------------------------------
# Analytics
# ---------------------------------------------------------------------------
class OrderStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta

        from apps.accounts.models import User

        last_30 = timezone.now() - timedelta(days=30)
        orders_qs = Order.objects.filter(created_at__gte=last_30)

        revenue = orders_qs.filter(payment_status=Order.PaymentStatus.PAID).aggregate(
            total=Sum("total")
        )["total"] or 0
        data = {
            "total_orders": Order.objects.count(),
            "pending_orders": Order.objects.filter(status=Order.Status.PENDING).count(),
            "paid_orders": Order.objects.filter(payment_status=Order.PaymentStatus.PAID).count(),
            "revenue_30d": revenue,
            "total_customers": User.objects.filter(role=User.Role.CUSTOMER).count(),
        }
        return Response(data)
