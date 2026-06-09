"""Seed the database with luxury perfume sample data."""
from __future__ import annotations

import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.catalog.models import Brand, Category, Product, ProductImage, Review
from apps.orders.models import Coupon

User = get_user_model()


BRANDS = [
    {"name": "Maison Noir", "country_of_origin": "France", "founded_year": 1928,
     "description": "A Parisian haute perfumery house crafting timeless, opulent fragrances."},
    {"name": "Atelier Or", "country_of_origin": "Italy", "founded_year": 1962,
     "description": "Sculpted Italian fragrances inspired by renaissance artistry."},
    {"name": "Veluto Royale", "country_of_origin": "United Kingdom", "founded_year": 1881,
     "description": "Heritage British perfumery with a modern avant-garde sensibility."},
    {"name": "Eden Privé", "country_of_origin": "Switzerland", "founded_year": 1975,
     "description": "Rare-ingredient Swiss perfumery, bottled in hand-cut crystal."},
    {"name": "Sable d'Or", "country_of_origin": "United Arab Emirates", "founded_year": 2003,
     "description": "Oud-forward中东 mastery blended with Parisian technique."},
]

CATEGORIES = [
    {"name": "Eau de Parfum", "description": "Long-lasting signature formulations.", "display_order": 1},
    {"name": "Parfum", "description": "Pure extrait — the most concentrated form.", "display_order": 2},
    {"name": "Eau de Toilette", "description": "Lighter, fresher compositions.", "display_order": 3},
    {"name": "Oud Collection", "description": "Rare oud-driven compositions.", "display_order": 4},
    {"name": "Body & Hair Mist", "description": "Delicate layered mists.", "display_order": 5},
    {"name": "Discovery Sets", "description": "Curated sets and minis.", "display_order": 6},
]

PRODUCTS = [
    {
        "name": "Noir Velours", "short_description": "Smoked oud, black rose and tonka.",
        "description": "An opulent extrait inspired by midnight velvet. Smoked oud entwines with damask rose, then settles into warm tonka and sandalwood.",
        "price": Decimal("18500.00"), "sale_price": Decimal("16500.00"),
        "volume_ml": 100, "concentration": "parfum", "gender": "unisex",
        "fragrance_family": "oriental",
        "top_notes": ["bergamot", "pink pepper", "cardamom"],
        "heart_notes": ["damask rose", "smoked oud", "saffron"],
        "base_notes": ["tonka bean", "sandalwood", "amber"],
        "is_bestseller": True, "is_featured": True,
    },
    {
        "name": "Aurum Privé", "short_description": "Sun-warmed amber and Tuscan iris.",
        "description": "Liquid sunlight — distilled amber laced with Florentine iris and white musk.",
        "price": Decimal("14900.00"),
        "volume_ml": 75, "concentration": "EDP", "gender": "women",
        "fragrance_family": "floral",
        "top_notes": ["mandarin", "pink pepper", "aldehydes"],
        "heart_notes": ["Tuscan iris", "orange blossom", "jasmine"],
        "base_notes": ["amber", "white musk", "cedarwood"],
        "is_bestseller": True, "is_new_arrival": True,
    },
    {
        "name": "Cuir d'Argent", "short_description": "Cool leather and silver birch.",
        "description": "A modern leather — supple, mineral, androgynous. Birch tar and suede layered over a cool iris heart.",
        "price": Decimal("17500.00"),
        "volume_ml": 100, "concentration": "EDP", "gender": "men",
        "fragrance_family": "leather",
        "top_notes": ["birch tar", "black pepper", "violet leaf"],
        "heart_notes": ["iris", "suede", "smoked tea"],
        "base_notes": ["cashmeran", "vetiver", "cedar"],
        "is_featured": True,
    },
    {
        "name": "Fleur d'Atlas", "short_description": "Atlas cedar, neroli and orange flower.",
        "description": "An ode to the Atlas mountains — woody neroli over cedar and sun-warmed skin musk.",
        "price": Decimal("12500.00"), "sale_price": Decimal("10500.00"),
        "volume_ml": 75, "concentration": "EDT", "gender": "unisex",
        "fragrance_family": "woody",
        "top_notes": ["neroli", "petitgrain", "bergamot"],
        "heart_notes": ["Atlas cedar", "orange flower", "cardamom"],
        "base_notes": ["musk", "vetiver", "ambroxan"],
        "is_bestseller": True,
    },
    {
        "name": "Rose d'Orient", "short_description": "Taif rose, saffron and dark honey.",
        "description": "An ode to the queen of roses — Taif rose absolute fused with saffron threads and dark forest honey.",
        "price": Decimal("21000.00"),
        "volume_ml": 50, "concentration": "parfum", "gender": "women",
        "fragrance_family": "floral",
        "top_notes": ["lychee", "pink pepper", "saffron"],
        "heart_notes": ["Taif rose", "Damascus rose", "honey"],
        "base_notes": ["oud", "patchouli", "vanilla"],
        "is_featured": True, "is_new_arrival": True,
    },
    {
        "name": "Sel d'Ocean", "short_description": "Salt-air marine accord and grapefruit zest.",
        "description": "A whisper of ocean spray — grapefruit zest over a transparent marine accord and warm ambergris.",
        "price": Decimal("9800.00"),
        "volume_ml": 100, "concentration": "EDT", "gender": "unisex",
        "fragrance_family": "aquatic",
        "top_notes": ["grapefruit", "bergamot", "sea salt"],
        "heart_notes": ["marine accord", "rosemary", "geranium"],
        "base_notes": ["ambergris", "cedarwood", "musk"],
        "is_new_arrival": True,
    },
    {
        "name": "Oud Impérial", "short_description": "Aged Laotian oud and Mysore sandalwood.",
        "description": "Twenty-five year aged Laotian oud blended with Mysore sandalwood and rose de Mai.",
        "price": Decimal("32500.00"),
        "volume_ml": 50, "concentration": "parfum", "gender": "unisex",
        "fragrance_family": "oriental",
        "top_notes": ["saffron", "pink pepper", "raspberry"],
        "heart_notes": ["Laotian oud", "rose de Mai", "cinnamon bark"],
        "base_notes": ["Mysore sandalwood", "amber", "castoreum"],
        "is_featured": True, "is_bestseller": True,
    },
    {
        "name": "Jardin de Minuit", "short_description": "Night-blooming jasmine and fig leaf.",
        "description": "A nocturnal garden in glass — night-blooming jasmine, fig leaf, and a heart of green mandarin.",
        "price": Decimal("11200.00"),
        "volume_ml": 75, "concentration": "EDP", "gender": "women",
        "fragrance_family": "green",
        "top_notes": ["green mandarin", "fig leaf", "galbanum"],
        "heart_notes": ["night jasmine", "tuberose", "ylang ylang"],
        "base_notes": ["fig wood", "musk", "amber"],
        "is_new_arrival": True,
    },
    {
        "name": "Bois Sauvage", "short_description": "Cypress, vetiver and smoked vanilla.",
        "description": "Untamed — a dry wood accord of cypress and vetiver sweetened with smoked vanilla absolute.",
        "price": Decimal("13900.00"), "sale_price": Decimal("11900.00"),
        "volume_ml": 100, "concentration": "EDP", "gender": "men",
        "fragrance_family": "woody",
        "top_notes": ["cypress", "grapefruit", "elemi"],
        "heart_notes": ["vetiver", "cedar", "geranium"],
        "base_notes": ["smoked vanilla", "patchouli", "labdanum"],
        "is_bestseller": True,
    },
    {
        "name": "Cristal d'Iris", "short_description": "Frozen iris and white ambrette.",
        "description": "A frozen iris over white ambrette and frosted musk — crystalline and meditative.",
        "price": Decimal("15800.00"),
        "volume_ml": 75, "concentration": "EDP", "gender": "unisex",
        "fragrance_family": "floral",
        "top_notes": ["frozen pear", "aldehydes", "white pepper"],
        "heart_notes": ["Florentine iris", "heliotrope", "violet"],
        "base_notes": ["white ambrette", "musk", "cashmere wood"],
        "is_featured": True,
    },
    {
        "name": "Tabac Royal", "short_description": "Pipe tobacco, rum and aged leather.",
        "description": "A gentleman's library — pipe tobacco, aged rum and supple leather bound in vanilla absolute.",
        "price": Decimal("14200.00"),
        "volume_ml": 100, "concentration": "EDP", "gender": "men",
        "fragrance_family": "oriental",
        "top_notes": ["rum", "cognac", "cardamom"],
        "heart_notes": ["pipe tobacco", "rose", "leather"],
        "base_notes": ["vanilla", "benzoin", "tobacco leaf"],
        "is_bestseller": True,
    },
    {
        "name": "Soleil de Marrakech", "short_description": "Saffron, dates and Argan wood.",
        "description": "Saffron threads, sun-warmed dates and Argan wood — a contemporary oriental.",
        "price": Decimal("16800.00"),
        "volume_ml": 75, "concentration": "EDP", "gender": "unisex",
        "fragrance_family": "oriental",
        "top_notes": ["saffron", "pink pepper", "dates"],
        "heart_notes": ["rose", "oud", "benzoin"],
        "base_notes": ["Argan wood", "amber", "vanilla"],
        "is_new_arrival": True,
    },
]

SAMPLE_REVIEWS = [
    ("Effortlessly elegant — I get compliments all day.", 5),
    ("Longevity is incredible. 10+ hours and still going.", 5),
    ("A touch sweet for me, but the sillage is gorgeous.", 4),
    ("Worth every rupee. Truly a signature scent.", 5),
    ("Beautiful bottle, beautiful juice. A new favourite.", 5),
    ("Subtle and refined, perfect for evenings.", 4),
]

COUPONS = [
    {"code": "WELCOME10", "discount_type": "percentage", "discount_value": Decimal("10"),
     "min_order_value": Decimal("2000"), "max_discount": Decimal("1500"),
     "description": "10% off your first order (max ₹1,500)."},
    {"code": "NAVCCI500", "discount_type": "fixed", "discount_value": Decimal("500"),
     "min_order_value": Decimal("5000"), "description": "Flat ₹500 off on orders over ₹5,000."},
    {"code": "FREESHIP", "discount_type": "free_shipping", "discount_value": Decimal("0"),
     "min_order_value": Decimal("0"), "description": "Free shipping on any order."},
]


class Command(BaseCommand):
    help = "Seed the database with luxury perfume sample data."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding Navcci Perfume database…"))

        # Admin
        if not User.objects.filter(email="admin@navcciperfume.in").exists():
            User.objects.create_superuser(
                email="admin@navcciperfume.in",
                username="admin",
                password="LuxeAdmin#2025",
                first_name="Luxe",
                last_name="Admin",
            )
            self.stdout.write(self.style.SUCCESS("Created admin@navcciperfume.in / LuxeAdmin#2025"))

        # Demo customer
        if not User.objects.filter(email="demo@navcciperfume.in").exists():
            User.objects.create_user(
                email="demo@navcciperfume.in",
                username="demo",
                password="LuxeDemo#2025",
                first_name="Aanya",
                last_name="Mehra",
                phone="+919999999999",
                is_active=True,
                email_verified_at=timezone.now(),
            )
            self.stdout.write(self.style.SUCCESS("Created demo@navcciperfume.in / LuxeDemo#2025"))

        # Brands
        brand_objs = {}
        for b in BRANDS:
            obj, _ = Brand.objects.update_or_create(
                name=b["name"],
                defaults={
                    "description": b["description"],
                    "country_of_origin": b["country_of_origin"],
                    "founded_year": b["founded_year"],
                    "is_active": True,
                },
            )
            brand_objs[b["name"]] = obj
        self.stdout.write(self.style.SUCCESS(f"Brands ready: {len(brand_objs)}"))

        # Categories
        category_objs = {}
        for c in CATEGORIES:
            obj, _ = Category.objects.update_or_create(
                name=c["name"],
                defaults={
                    "description": c["description"],
                    "display_order": c["display_order"],
                    "is_active": True,
                },
            )
            category_objs[c["name"]] = obj
        self.stdout.write(self.style.SUCCESS(f"Categories ready: {len(category_objs)}"))

        # Products
        for idx, p in enumerate(PRODUCTS):
            brand_name = random.choice(list(brand_objs.keys()))
            product, created = Product.objects.update_or_create(
                name=p["name"],
                defaults={
                    "short_description": p["short_description"],
                    "description": p["description"],
                    "price": p["price"],
                    "sale_price": p.get("sale_price"),
                    "volume_ml": p["volume_ml"],
                    "concentration": p["concentration"],
                    "gender": p["gender"],
                    "fragrance_family": p["fragrance_family"],
                    "top_notes": p["top_notes"],
                    "heart_notes": p["heart_notes"],
                    "base_notes": p["base_notes"],
                    "is_featured": p.get("is_featured", False),
                    "is_bestseller": p.get("is_bestseller", False),
                    "is_new_arrival": p.get("is_new_arrival", False),
                    "is_active": True,
                    "stock_quantity": random.randint(15, 60),
                    "brand": brand_objs[brand_name],
                    "meta_description": f"Buy {p['name']} by {brand_name} at Navcci Perfume.",
                },
            )
            product.categories.add(category_objs["Eau de Parfum"])
            if product.concentration == "parfum":
                product.categories.add(category_objs["Parfum"])
            if product.concentration == "EDT":
                product.categories.add(category_objs["Eau de Toilette"])
            if "oud" in (p["name"] + "".join(p["top_notes"] + p["heart_notes"] + p["base_notes"])).lower():
                product.categories.add(category_objs["Oud Collection"])

            # Add a single placeholder image
            if not product.images.exists():
                ProductImage.objects.create(
                    product=product,
                    image=f"products/seed/{idx+1}.jpg",
                    alt_text=product.name,
                    is_primary=True,
                    display_order=0,
                )

        # Reviews
        for product in Product.objects.all()[:6]:
            for body, rating in SAMPLE_REVIEWS:
                Review.objects.get_or_create(
                    product=product,
                    user=User.objects.filter(email="demo@navcciperfume.in").first(),
                    defaults={
                        "rating": rating,
                        "title": "Beautiful fragrance",
                        "body": body,
                        "is_approved": True,
                        "is_verified_purchase": True,
                    },
                )
            product.refresh_rating_aggregates()

        # Coupons
        for c in COUPONS:
            Coupon.objects.update_or_create(
                code=c["code"],
                defaults={
                    "discount_type": c["discount_type"],
                    "discount_value": c["discount_value"],
                    "min_order_value": c["min_order_value"],
                    "max_discount": c.get("max_discount"),
                    "description": c["description"],
                    "starts_at": timezone.now() - timedelta(days=1),
                    "expires_at": timezone.now() + timedelta(days=180),
                    "is_active": True,
                    "usage_limit_per_user": 1,
                },
            )

        self.stdout.write(self.style.SUCCESS("Seed completed successfully."))
