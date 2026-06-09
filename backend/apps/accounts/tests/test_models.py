"""Account model and auth tests."""
from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model

from apps.accounts.models import Address

User = get_user_model()
pytestmark = pytest.mark.django_db


def test_create_user():
    user = User.objects.create_user(
        email="a@b.com", username="alpha", password="S3cretP@ss!", first_name="Alpha"
    )
    assert user.email == "a@b.com"
    assert user.check_password("S3cretP@ss!")
    assert user.role == User.Role.CUSTOMER


def test_create_superuser():
    user = User.objects.create_superuser(email="a@b.com", username="root", password="S3cretP@ss!")
    assert user.is_staff
    assert user.is_superuser


def test_full_name_fallback():
    user = User.objects.create_user(email="a@b.com", username="alpha", password="S3cretP@ss!")
    assert user.full_name == "alpha"


def test_address_creation():
    user = User.objects.create_user(email="a@b.com", username="alpha", password="S3cretP@ss!")
    addr = Address.objects.create(
        user=user, full_name="Alpha", phone="+919999999999",
        line1="Marine Drive", city="Mumbai", state="MH", postal_code="400001"
    )
    assert str(addr).startswith("Alpha")
