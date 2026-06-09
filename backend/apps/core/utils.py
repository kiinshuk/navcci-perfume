"""Shared utilities."""
from __future__ import annotations

import json
import logging
import re
import uuid

from django.utils.text import slugify


def unique_slug(model, name: str, slug_field: str = "slug") -> str:
    base = slugify(name) or uuid.uuid4().hex[:8]
    slug = base
    counter = 1
    while model.objects.filter(**{slug_field: slug}).exists():
        counter += 1
        slug = f"{base}-{counter}"
    return slug


def generate_sku(prefix: str = "LX") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone or "")
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    return phone or ""


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:  # noqa: D401
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)
