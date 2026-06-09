"""Catalog views: products, brands, categories, reviews, search."""
from __future__ import annotations

from django.core.cache import cache
from django.db.models import Avg, Count, F, Q
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.filters import ProductFilter
from apps.catalog.models import Brand, Category, Product, Review
from apps.catalog.serializers import (
    BrandSerializer,
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewCreateSerializer,
    ReviewSerializer,
)
from apps.core.permissions import IsAdminOrReadOnly, IsVerifiedPurchaser
from apps.core.utils import unique_slug


CATEGORY_CACHE_KEY = "luxe:catalog:categories:tree"
PRODUCT_TIMEOUT = 60 * 5


# ---------------------------------------------------------------------------
# Brands / Categories
# ---------------------------------------------------------------------------
class BrandViewSet(viewsets.ModelViewSet):
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Brand.objects.filter(is_active=True).order_by("name")

    def perform_create(self, serializer):
        instance = serializer.save()
        if not instance.slug:
            instance.slug = unique_slug(Brand, instance.name)
            instance.save(update_fields=["slug"])


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "slug"

    def get_queryset(self):
        return Category.objects.filter(is_active=True).select_related("parent")

    def list(self, request, *args, **kwargs):
        cached = cache.get(CATEGORY_CACHE_KEY)
        if cached is not None and not request.user.is_staff:
            return Response(cached)
        data = self.get_serializer(self.get_queryset(), many=True).data
        cache.set(CATEGORY_CACHE_KEY, data, 60 * 60)
        return Response(data)

    def perform_create(self, serializer):
        instance = serializer.save()
        if not instance.slug:
            instance.slug = unique_slug(Category, instance.name)
            instance.save(update_fields=["slug"])
        cache.delete(CATEGORY_CACHE_KEY)

    def perform_update(self, serializer):
        super().perform_update(serializer)
        cache.delete(CATEGORY_CACHE_KEY)


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrReadOnly]
    filterset_class = ProductFilter
    search_fields = ("name", "description", "brand__name", "top_notes", "heart_notes", "base_notes")
    ordering_fields = ("price", "created_at", "average_rating", "sales_count")
    ordering = ("-created_at",)
    lookup_field = "slug"

    def get_queryset(self):
        qs = (
            Product.objects.filter(is_active=True)
            .select_related("brand")
            .prefetch_related("images", "categories", "reviews")
        )
        if self.action == "retrieve":
            return qs
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAdminUser()]
        return super().get_permissions()

    @extend_schema(
        parameters=[
            OpenApiParameter(name="min_price", type=float),
            OpenApiParameter(name="max_price", type=float),
            OpenApiParameter(name="brand", type=str),
            OpenApiParameter(name="category", type=str),
            OpenApiParameter(name="gender", type=str),
            OpenApiParameter(name="fragrance_family", type=str),
            OpenApiParameter(name="min_rating", type=float),
            OpenApiParameter(name="in_stock", type=bool),
            OpenApiParameter(name="notes", type=str, description="Comma-separated notes."),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(responses=ProductDetailSerializer)
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:8]
        return Response(ProductListSerializer(qs, many=True, context={"request": request}).data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def bestsellers(self, request):
        qs = self.get_queryset().filter(is_bestseller=True).order_by("-sales_count")[:8]
        return Response(ProductListSerializer(qs, many=True, context={"request": request}).data)

    @action(detail=False, methods=["get"], permission_classes=[AllowAny])
    def new_arrivals(self, request):
        qs = self.get_queryset().filter(is_new_arrival=True)[:8]
        return Response(ProductListSerializer(qs, many=True, context={"request": request}).data)


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------
class SearchView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        parameters=[
            OpenApiParameter(name="q", type=str, required=True),
            OpenApiParameter(name="limit", type=int, required=False),
        ]
    )
    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        limit = int(request.query_params.get("limit") or 20)
        if not query:
            return Response({"results": []})
        qs = (
            Product.objects.filter(is_active=True)
            .filter(
                Q(name__icontains=query)
                | Q(description__icontains=query)
                | Q(brand__name__icontains=query)
                | Q(top_notes__icontains=query)
                | Q(heart_notes__icontains=query)
                | Q(base_notes__icontains=query)
            )
            .distinct()[:limit]
        )
        return Response(
            {"results": ProductListSerializer(qs, many=True, context={"request": request}).data}
        )


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action in ("update", "partial_update", "destroy"):
            return [IsAuthenticated()]
        if self.action == "create":
            return [IsVerifiedPurchaser()]
        return [AllowAny()]

    def get_queryset(self):
        qs = Review.objects.filter(is_active=True, is_approved=True)
        product_slug = self.kwargs.get("product_slug") or self.request.query_params.get("product")
        if product_slug:
            qs = qs.filter(product__slug=product_slug)
        return qs.select_related("user", "product")

    def get_serializer_class(self):
        if self.action == "create":
            return ReviewCreateSerializer
        return ReviewSerializer

    def perform_create(self, serializer):
        product = get_object_or_404(Product, slug=self.kwargs["product_slug"], is_active=True)
        review = serializer.save(
            user=self.request.user,
            product=product,
            is_verified_purchase=True,
        )
        # Refresh aggregates
        product.refresh_rating_aggregates()
        review.is_approved = True  # auto-approve; admin moderation hook available
        review.save(update_fields=["is_approved"])


# ---------------------------------------------------------------------------
# Analytics (admin)
# ---------------------------------------------------------------------------
class CatalogStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            "products": Product.objects.count(),
            "active_products": Product.objects.filter(is_active=True).count(),
            "low_stock": Product.objects.filter(
                is_active=True, track_inventory=True, stock_quantity__lte=F("low_stock_threshold")
            ).count(),
            "brands": Brand.objects.filter(is_active=True).count(),
            "categories": Category.objects.filter(is_active=True).count(),
            "reviews_pending": Review.objects.filter(is_active=True, is_approved=False).count(),
        }
        return Response(data)
