from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog import views

router = DefaultRouter()
router.register(r"products", views.ProductViewSet, basename="product")
router.register(r"brands", views.BrandViewSet, basename="brand")
router.register(r"categories", views.CategoryViewSet, basename="category")

urlpatterns = [
    path("search/", views.SearchView.as_view(), name="search"),
    path("catalog/stats/", views.CatalogStatsView.as_view(), name="catalog-stats"),
    path(
        "products/<slug:product_slug>/reviews/",
        views.ReviewViewSet.as_view({"get": "list", "post": "create"}),
        name="product-reviews",
    ),
    path(
        "products/<slug:product_slug>/reviews/<uuid:pk>/",
        views.ReviewViewSet.as_view({"patch": "partial_update", "delete": "destroy"}),
        name="product-review-detail",
    ),
    path("", include(router.urls)),
]
