from django.contrib import admin
from django.utils.html import format_html

from apps.catalog.models import Brand, Category, Product, ProductImage, Review


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "display_order", "preview")
    readonly_fields = ("preview",)

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:50px;border-radius:4px"/>', obj.image.url)
        return "—"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "brand",
        "price",
        "sale_price",
        "stock_quantity",
        "is_featured",
        "is_bestseller",
        "is_new_arrival",
        "is_active",
    )
    list_filter = (
        "is_active",
        "is_featured",
        "is_bestseller",
        "is_new_arrival",
        "gender",
        "concentration",
        "fragrance_family",
        "brand",
    )
    search_fields = ("name", "sku", "slug", "brand__name")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("sku", "average_rating", "review_count", "sales_count", "created_at", "updated_at")
    inlines = [ProductImageInline]
    filter_horizontal = ("categories",)


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "country_of_origin", "founded_year", "is_active")
    list_filter = ("is_active", "country_of_origin")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "parent", "display_order", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "is_approved", "is_verified_purchase", "created_at")
    list_filter = ("rating", "is_approved", "is_verified_purchase")
    search_fields = ("product__name", "user__email", "title", "body")
    actions = ("approve_reviews",)

    def approve_reviews(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(is_approved=True, approved_at=timezone.now())
        for review in queryset:
            review.product.refresh_rating_aggregates()
        self.message_user(request, f"{updated} reviews approved.")
