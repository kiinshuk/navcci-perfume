"""Custom permission classes."""
from __future__ import annotations

from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "customer", None)
        if owner is None and hasattr(obj, "order"):
            owner = obj.order.user
        return owner == request.user or request.user.is_staff


class IsVerifiedPurchaser(BasePermission):
    """Allows only users who have purchased the product to review it."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        product_id = view.kwargs.get("product_id") or request.data.get("product")
        from apps.orders.models import Order

        return Order.objects.filter(
            user=request.user,
            items__product_id=product_id,
            status=Order.Status.DELIVERED,
        ).exists()


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)
