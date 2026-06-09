"""Serializers for the catalog app."""
from __future__ import annotations

from rest_framework import serializers

from apps.catalog.models import Brand, Category, Product, ProductImage, Review


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "description",
            "country_of_origin",
            "founded_year",
            "hero_image",
        )


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "image", "display_order")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt_text", "is_primary", "display_order")


class ProductListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    display_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    is_on_sale = serializers.BooleanField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(source="is_in_stock", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "sku",
            "short_description",
            "price",
            "sale_price",
            "display_price",
            "is_on_sale",
            "discount_percent",
            "currency",
            "in_stock",
            "volume_ml",
            "concentration",
            "gender",
            "fragrance_family",
            "brand",
            "primary_image",
            "average_rating",
            "review_count",
            "is_featured",
            "is_bestseller",
            "is_new_arrival",
        )

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary and primary.image:
            request = self.context.get("request")
            url = primary.image.url
            return request.build_absolute_uri(url) if request else url
        return None


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    categories = CategorySerializer(many=True, read_only=True)
    description = serializers.CharField()
    story = serializers.CharField()
    ingredients = serializers.CharField()
    top_notes = serializers.JSONField()
    heart_notes = serializers.JSONField()
    base_notes = serializers.JSONField()
    stock_quantity = serializers.IntegerField(read_only=True)
    related = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            "description",
            "story",
            "ingredients",
            "top_notes",
            "heart_notes",
            "base_notes",
            "images",
            "categories",
            "stock_quantity",
            "low_stock_threshold",
            "meta_title",
            "meta_description",
            "related",
        )

    def get_related(self, obj):
        related = (
            Product.objects.filter(is_active=True, brand=obj.brand)
            .exclude(pk=obj.pk)
            .order_by("-is_bestseller", "-average_rating")[:4]
        )
        return ProductListSerializer(related, many=True, context=self.context).data


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = (
            "id",
            "product",
            "user",
            "user_name",
            "rating",
            "title",
            "body",
            "is_verified_purchase",
            "is_approved",
            "created_at",
        )
        read_only_fields = ("id", "user", "is_verified_purchase", "is_approved", "created_at", "user_name")

    def get_user_name(self, obj):
        if obj.user:
            return obj.user.full_name
        return "Anonymous"

    def validate_rating(self, value: int) -> int:
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ("rating", "title", "body")
