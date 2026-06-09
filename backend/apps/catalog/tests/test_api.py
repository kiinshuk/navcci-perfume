"""Product API tests."""
from __future__ import annotations

from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product

pytestmark = pytest.mark.django_db


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def product():
    brand = Brand.objects.create(name="Maison T", slug="maison-t")
    cat = Category.objects.create(name="EDP", slug="edp")
    p = Product.objects.create(
        name="Scent A", slug="scent-a", sku="LX-A-1", brand=brand,
        price=Decimal("2500.00"), stock_quantity=10,
        fragrance_family="floral", gender="women",
    )
    p.categories.add(cat)
    return p


def test_list_products(client, product):
    res = client.get("/api/products/")
    assert res.status_code == 200
    assert res.json()["count"] == 1


def test_product_detail(client, product):
    res = client.get(f"/api/products/{product.slug}/")
    assert res.status_code == 200
    assert res.json()["name"] == "Scent A"


def test_filter_by_gender(client, product):
    res = client.get("/api/products/?gender=women")
    assert res.json()["count"] == 1
    res = client.get("/api/products/?gender=men")
    assert res.json()["count"] == 0
