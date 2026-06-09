"""Views for accounts: registration, auth, profile, addresses, wishlist."""
from __future__ import annotations

import logging
import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.accounts.models import Address, EmailOTP, Wishlist
from apps.accounts.serializers import (
    AddressSerializer,
    ChangePasswordSerializer,
    LuxeTokenObtainPairSerializer,
    OTPVerifySerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
    WishlistSerializer,
    issue_tokens_for,
)
from apps.core.throttling import AuthRateThrottle

User = get_user_model()
logger = logging.getLogger("navcci.accounts")


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(request=RegisterSerializer, responses={201: UserSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            user = serializer.save()
        # Auto-activate for demo; in production require email verification.
        user.is_active = True
        user.save(update_fields=["is_active"])
        return Response(issue_tokens_for(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    @extend_schema(
        request=LuxeTokenObtainPairSerializer,
        responses={200: OpenApiResponse(description="JWT pair + user profile")},
    )
    def post(self, request):
        serializer = LuxeTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.user
        if not user.is_active:
            return Response(
                {"success": False, "error": {"code": "inactive", "message": "Account is not active."}},
                status=status.HTTP_403_FORBIDDEN,
            )
        if request.META.get("REMOTE_ADDR"):
            user.last_login_ip = request.META.get("REMOTE_ADDR")
            user.save(update_fields=["last_login_ip"])
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh = request.data.get("refresh")
            token = RefreshToken(refresh)
            token.blacklist()
        except Exception:  # noqa: BLE001
            return Response(
                {"success": False, "error": {"code": "invalid_token", "message": "Invalid refresh token."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data.get("user")
        if user:
            code = f"{random.randint(100000, 999999)}"
            EmailOTP.objects.create(
                user=user, code=code, purpose="reset_password", expires_at=timezone.now() + timedelta(minutes=15)
            )
            # Email send is queued in real app; log for now.
            logger.info("Password reset OTP for %s is %s", user.email, code)
        return Response({"success": True, "message": "If the email exists, an OTP has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        otp = serializer.validated_data["otp_obj"]
        with transaction.atomic():
            user.set_password(serializer.validated_data["new_password"])
            user.save(update_fields=["password"])
            otp.consumed = True
            otp.save(update_fields=["consumed"])
        return Response({"success": True, "message": "Password updated."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"success": True, "message": "Password changed."})


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        otp = (
            EmailOTP.objects.filter(
                user__email__iexact=serializer.validated_data["email"], purpose="verify_email", consumed=False
            )
            .order_by("-created_at")
            .first()
        )
        if not otp or otp.code != serializer.validated_data["otp"] or not otp.is_valid():
            return Response(
                {"success": False, "error": {"code": "invalid_otp", "message": "Invalid or expired code."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            otp.user.verify_email()
            otp.consumed = True
            otp.save(update_fields=["consumed"])
        return Response(issue_tokens_for(otp.user))


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


# ---------------------------------------------------------------------------
# Addresses
# ---------------------------------------------------------------------------
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        addr = serializer.save(user=self.request.user)
        if addr.is_default_shipping:
            Address.objects.filter(user=self.request.user, is_default_shipping=True).exclude(id=addr.id).update(
                is_default_shipping=False
            )
        if addr.is_default_billing:
            Address.objects.filter(user=self.request.user, is_default_billing=True).exclude(id=addr.id).update(
                is_default_billing=False
            )

    @action(detail=True, methods=["post"])
    def set_default(self, request, pk=None):
        addr = self.get_object()
        Address.objects.filter(user=request.user, is_default_shipping=True).update(is_default_shipping=False)
        addr.is_default_shipping = True
        addr.save(update_fields=["is_default_shipping"])
        return Response(AddressSerializer(addr).data)


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------
class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        return Response(WishlistSerializer(wishlist).data)

    def post(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        from apps.catalog.models import Product

        try:
            product = Product.objects.get(pk=request.data.get("product_id"), is_active=True)
        except Product.DoesNotExist:
            return Response(
                {"success": False, "error": {"code": "not_found", "message": "Product not found."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        wishlist.products.add(product)
        return Response(WishlistSerializer(wishlist).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        from apps.catalog.models import Product

        try:
            product = Product.objects.get(pk=request.data.get("product_id"))
            wishlist.products.remove(product)
        except Product.DoesNotExist:
            pass
        return Response(WishlistSerializer(wishlist).data)


# ---------------------------------------------------------------------------
# Decorated refresh view (provides /api/auth/refresh/)
# ---------------------------------------------------------------------------
class TokenRefreshProxyView(TokenRefreshView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthRateThrottle]
