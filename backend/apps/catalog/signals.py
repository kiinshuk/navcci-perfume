"""Signals for the catalog app."""
from __future__ import annotations

from django.db.models import Avg, Count
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from apps.catalog.models import Review


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def refresh_product_aggregates(sender, instance, **kwargs):
    product = instance.product
    product.refresh_rating_aggregates()
