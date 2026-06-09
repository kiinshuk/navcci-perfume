"""Catalog domain models: Brand, Category, Product, ProductImage, Review."""
from __future__ import annotations

import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify

from apps.core.mixins import SoftDeleteModel, TimestampedModel
from apps.core.utils import generate_sku


class Brand(TimestampedModel, SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    description = models.TextField(blank=True)
    country_of_origin = models.CharField(max_length=80, blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="brands/hero/", blank=True, null=True)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Category(TimestampedModel, SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True, db_index=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("display_order", "name")
        verbose_name_plural = "Categories"

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimestampedModel, SoftDeleteModel):
    class Gender(models.TextChoices):
        UNISEX = "unisex", "Unisex"
        MEN = "men", "Men"
        WOMEN = "women", "Women"
        NEUTRAL = "neutral", "Neutral"

    class Concentration(models.TextChoices):
        EDP = "EDP", "Eau de Parfum"
        EDT = "EDT", "Eau de Toilette"
        PARFUM = "parfum", "Parfum"
        COLOGNE = "cologne", "Cologne"
        BODY = "body", "Body Mist"

    class FragranceFamily(models.TextChoices):
        FLORAL = "floral", "Floral"
        ORIENTAL = "oriental", "Oriental"
        WOODY = "woody", "Woody"
        FRESH = "fresh", "Fresh"
        CITRUS = "citrus", "Citrus"
        FOUGERE = "fougere", "Fougère"
        CHYPRE = "chyppre", "Chypre"
        GOURMAND = "gourmand", "Gourmand"
        LEATHER = "leather", "Leather"
        AQUATIC = "aquatic", "Aquatic"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True)
    sku = models.CharField(max_length=40, unique=True, db_index=True)
    short_description = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    story = models.TextField(blank=True, help_text="Editorial brand story shown on PDP")

    price = models.DecimalField(max_digits=12, decimal_places=2)
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default="INR")

    stock_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=3)
    track_inventory = models.BooleanField(default=True)
    is_in_stock = models.GeneratedField(
        expression=models.Case(
            models.When(track_inventory=True, stock_quantity__gt=0, then=models.Value(True)),
            default=models.Value(True),
            output_field=models.BooleanField(),
        ),
        output_field=models.BooleanField(),
        db_persist=True,
    )

    volume_ml = models.PositiveIntegerField(default=50, help_text="Bottle volume in ml")
    concentration = models.CharField(
        max_length=20, choices=Concentration.choices, default=Concentration.EDP
    )
    gender = models.CharField(max_length=20, choices=Gender.choices, default=Gender.UNISEX)
    fragrance_family = models.CharField(
        max_length=20, choices=FragranceFamily.choices, default=FragranceFamily.FLORAL
    )

    top_notes = models.JSONField(default=list, blank=True, help_text="['bergamot', 'pink pepper']")
    heart_notes = models.JSONField(default=list, blank=True)
    base_notes = models.JSONField(default=list, blank=True)
    ingredients = models.TextField(blank=True)

    brand = models.ForeignKey(Brand, on_delete=models.PROTECT, related_name="products")
    categories = models.ManyToManyField(Category, related_name="products", blank=True)

    is_featured = models.BooleanField(default=False, db_index=True)
    is_bestseller = models.BooleanField(default=False, db_index=True)
    is_new_arrival = models.BooleanField(default=False, db_index=True)

    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    sales_count = models.PositiveIntegerField(default=0)

    meta_title = models.CharField(max_length=160, blank=True)
    meta_description = models.CharField(max_length=200, blank=True)
    meta_keywords = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["is_active", "is_featured"]),
            models.Index(fields=["is_active", "is_bestseller"]),
            models.Index(fields=["is_active", "is_new_arrival"]),
            models.Index(fields=["is_active", "price"]),
            models.Index(fields=["brand", "is_active"]),
            models.Index(fields=["fragrance_family", "is_active"]),
            models.Index(fields=["gender", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        if not self.sku:
            self.sku = generate_sku("LXP")
        if not self.meta_title:
            self.meta_title = f"{self.name} — {self.brand.name} | Navcci Perfume"
        super().save(*args, **kwargs)

    @property
    def is_on_sale(self) -> bool:
        return self.sale_price is not None and self.sale_price < self.price

    @property
    def display_price(self):
        return self.sale_price if self.is_on_sale else self.price

    @property
    def discount_percent(self) -> int:
        if not self.is_on_sale:
            return 0
        return int(((self.price - self.sale_price) / self.price) * 100)

    def refresh_rating_aggregates(self) -> None:
        from django.db.models import Avg, Count

        aggregates = self.reviews.filter(is_approved=True, is_active=True).aggregate(
            avg=Avg("rating"), count=Count("id")
        )
        self.average_rating = aggregates["avg"] or 0
        self.review_count = aggregates["count"] or 0
        self.save(update_fields=["average_rating", "review_count"])


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/%Y/%m/")
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("display_order", "created_at")

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).exclude(pk=self.pk).update(
                is_primary=False
            )
        super().save(*args, **kwargs)


class Review(TimestampedModel, SoftDeleteModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=160, blank=True)
    body = models.TextField()
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False, db_index=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        unique_together = ("product", "user")
        indexes = [models.Index(fields=["product", "is_approved"])]

    def __str__(self) -> str:
        return f"{self.rating}★ — {self.product.name}"
