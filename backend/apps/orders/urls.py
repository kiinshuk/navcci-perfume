from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.orders import views

router = DefaultRouter()
router.register(r"orders", views.OrderViewSet, basename="order")
router.register(r"coupons", views.CouponViewSet, basename="coupon")

urlpatterns = [
    path("cart/", views.CartView.as_view(), name="cart"),
    path("cart/items/", views.CartItemView.as_view(), name="cart-items"),
    path("cart/items/<uuid:item_id>/", views.CartItemView.as_view(), name="cart-item-detail"),
    path(
        "cart/items/<uuid:item_id>/save-for-later/",
        views.CartItemSaveForLaterView.as_view(),
        name="cart-item-save",
    ),
    path("cart/coupon/", views.ApplyCouponView.as_view(), name="cart-coupon"),
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("orders/stats/", views.OrderStatsView.as_view(), name="order-stats"),
    path("", include(router.urls)),
]
