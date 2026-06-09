from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.accounts import views

router = DefaultRouter()
router.register(r"addresses", views.AddressViewSet, basename="address")

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", views.TokenRefreshProxyView.as_view(), name="token-refresh"),
    path("password/reset/", views.PasswordResetRequestView.as_view(), name="password-reset"),
    path("password/reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("password/change/", views.ChangePasswordView.as_view(), name="password-change"),
    path("email/verify/", views.VerifyEmailView.as_view(), name="email-verify"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
    path("wishlist/", views.WishlistView.as_view(), name="wishlist"),
    path("", include(router.urls)),
]
