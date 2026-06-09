"""Filters for the catalog API."""
from __future__ import annotations

import django_filters
from django.db.models import Q

from apps.catalog.models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    brand = django_filters.CharFilter(field_name="brand__slug")
    brand_id = django_filters.UUIDFilter(field_name="brand_id")
    category = django_filters.CharFilter(field_name="categories__slug")
    gender = django_filters.CharFilter(field_name="gender")
    fragrance_family = django_filters.CharFilter(field_name="fragrance_family")
    concentration = django_filters.CharFilter(field_name="concentration")
    min_rating = django_filters.NumberFilter(field_name="average_rating", lookup_expr="gte")
    in_stock = django_filters.BooleanFilter(method="filter_in_stock")
    is_featured = django_filters.BooleanFilter()
    is_bestseller = django_filters.BooleanFilter()
    is_new_arrival = django_filters.BooleanFilter()
    notes = django_filters.CharFilter(method="filter_notes")

    class Meta:
        model = Product
        fields = []

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_quantity__gt=0)
        return queryset.filter(stock_quantity=0)

    def filter_notes(self, queryset, name, value):
        notes = [n.strip().lower() for n in value.split(",") if n.strip()]
        q = Q()
        for n in notes:
            q |= Q(top_notes__contains=[{"name": n}]) | Q(top_notes__icontains=n)
            q |= Q(heart_notes__contains=[{"name": n}]) | Q(heart_notes__icontains=n)
            q |= Q(base_notes__contains=[{"name": n}]) | Q(base_notes__icontains=n)
        return queryset.filter(q)
