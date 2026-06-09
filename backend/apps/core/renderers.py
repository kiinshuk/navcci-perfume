"""Renderer that emits JSON with PascalCase keys to match the Next.js client."""
from __future__ import annotations

import re

from rest_framework.renderers import JSONRenderer

_first_cap_re = re.compile(r"(.)([A-Z][a-z]+)")
_all_cap_re = re.compile(r"([a-z0-9])([A-Z])")


def to_pascal_case(value: str) -> str:
    if not value:
        return value
    if value.startswith("_"):
        return value
    s = _first_cap_re.sub(r"\1_\2", value)
    s = _all_cap_re.sub(r"\1_\2", s)
    return "".join(part.capitalize() for part in s.split("_"))


def pascalize(obj):
    if isinstance(obj, dict):
        return {to_pascal_case(k): pascalize(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [pascalize(v) for v in obj]
    return obj


class PascalCaseRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is not None:
            data = pascalize(data)
        return super().render(data, accepted_media_type, renderer_context)
