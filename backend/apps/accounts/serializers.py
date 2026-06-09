"""Serializers for the accounts app."""
from __future__ import annotations

import random
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Address, EmailOTP, Wishlist
from apps.core.utils import normalize_phone

User = get_user_model()


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
class LuxeTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accepts either the USERNAME_FIELD (email) or a literal `username` field
    (which may contain the user's email OR their actual username).
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from rest_framework import serializers as _ser
        # Make the primary identifier optional — the client may send `username` instead.
        self.fields[self.username_field].required = False
        self.fields[self.username_field].allow_blank = True
        # Add a `username` alias field (optional).
        self.fields["username"] = _ser.CharField(
            required=False, allow_blank=True, write_only=True, max_length=254,
        )

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        token["email"] = user.email
        return token

    def validate(self, attrs):
        identifier = attrs.get(self.username_field) or attrs.get("username")
        if not identifier:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({self.username_field: "This field is required.", "username": "This field is required."})
        attrs[self.username_field] = identifier
        attrs.pop("username", None)
        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "username", "first_name", "last_name", "phone", "password", "password_confirm")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_username(self, value: str) -> str:
        value = value.strip()
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is taken.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated):
        password = validated.pop("password")
        validated["phone"] = normalize_phone(validated.get("phone", ""))
        user = User.objects.create_user(password=password, **validated)
        EmailOTP.objects.create(
            user=user,
            code=f"{random.randint(100000, 999999)}",
            purpose="verify_email",
            expires_at=timezone.now() + timedelta(minutes=15),
        )
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value: str) -> str:
        try:
            self.user = User.objects.get(email__iexact=value.lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("No account with that email.")
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8, max_length=128, write_only=True)

    def validate(self, attrs):
        try:
            user = User.objects.get(email__iexact=attrs["email"].lower())
        except User.DoesNotExist as exc:
            raise serializers.ValidationError({"email": "Invalid email."}) from exc

        otp = (
            EmailOTP.objects.filter(user=user, purpose="reset_password", code=attrs["otp"], consumed=False)
            .order_by("-created_at")
            .first()
        )
        if not otp or not otp.is_valid():
            raise serializers.ValidationError({"otp": "Invalid or expired code."})

        attrs["user"] = user
        attrs["otp_obj"] = otp
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8, max_length=128)

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


# ---------------------------------------------------------------------------
# User / Profile
# ---------------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_active",
            "email_verified_at",
            "created_at",
        )
        read_only_fields = ("id", "email", "role", "is_active", "email_verified_at", "created_at")


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("first_name", "last_name", "phone")


class AddressSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Address
        fields = (
            "id",
            "label",
            "full_name",
            "phone",
            "line1",
            "line2",
            "city",
            "state",
            "postal_code",
            "country",
            "is_default_shipping",
            "is_default_billing",
        )

    def validate_phone(self, value: str) -> str:
        return normalize_phone(value)


# ---------------------------------------------------------------------------
# Wishlist
# ---------------------------------------------------------------------------
class WishlistSerializer(serializers.ModelSerializer):
    from apps.catalog.serializers import ProductListSerializer

    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ("id", "products", "created_at", "updated_at")
        read_only_fields = fields


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def issue_tokens_for(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }
