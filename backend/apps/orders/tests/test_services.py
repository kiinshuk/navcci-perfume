"""Product & coupon service tests."""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone

from apps.catalog.models import Brand, Category, Product
from apps.orders.models import Coupon
from apps.orders.services import apply_coupon, create_order_from_cart, get_or_create_cart
from django.contrib.auth import get_user_model

User = get_user_model()
pytestmark = pytest.mark.django_db


@pytest.fixture
def product(db):
    brand = Brand.objects.create(name="Maison Test", slug="maison-test")
    cat = Category.objects.create(name="EDP", slug="edp")
    p = Product.objects.create(
        name="Test Scent", slug="test-scent", sku="LX-TEST-1", brand=brand,
        price=Decimal("1000.00"), stock_quantity=10, fragrance_family="floral", gender="unisex",
    )
    p.categories.add(cat)
    return p


def test_apply_percentage_coupon(product):
    user = User.objects.create_user(email="a@b.com", username="alpha", password="P@ss1234!")
    cart = get_or_create_cart(user=user)
    from apps.orders.services import add_to_cart
    add_to_cart(cart, str(product.id), quantity=2)
    coupon = Coupon.objects.create(
        code="TEN", discount_type=Coupon.DiscountType.PERCENTAGE, discount_value=Decimal("10"),
        min_order_value=Decimal("0"), starts_at=timezone.now() - timedelta(days=1),
        expires_at=timezone.now() + timedelta(days=1),
    )
    apply_coupon(cart, "TEN")
    assert cart.subtotal == Decimal("2000.00")
    assert cart.discount == Decimal("200.00")


def test_create_order_decrements_stock(product):
    user = User.objects.create_user(email="a@b.com", username="alpha", password="P@ss1234!")
    cart = get_or_create_cart(user=user)
    from apps.orders.services import add_to_cart
    add_to_cart(cart, str(product.id), quantity=3)
    order = create_order_from_cart(
        cart=cart,
        checkout_data={
            "shippingFullName": "Alpha", "shippingPhone": "+919999999999",
            "shippingLine1": "X", "shippingCity": "Mumbai", "shippingState": "MH",
            "shippingPostalCode": "400001",
        },
        user=user,
    )
    product.refresh_from_db()
    assert product.stock_quantity == 7
    assert order.items.count() == 1
