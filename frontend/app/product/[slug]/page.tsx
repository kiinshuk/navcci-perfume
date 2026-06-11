import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { productsApi, reviewsApi } from "@/lib/services";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductBuyBox } from "@/components/product/product-buybox";
import { ProductDetails } from "@/components/product/product-details";
import { ProductCard } from "@/components/product/product-card";
import { SITE } from "@/lib/site";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productsApi.detail(slug);
    return {
      title: product.metaTitle || `${product.name} — ${product.brand.name}`,
      description: product.metaDescription || product.shortDescription,
      alternates: { canonical: `/product/${product.slug}` },
      openGraph: {
        title: `${product.name} by ${product.brand.name}`,
        description: product.shortDescription,
        images: product.primaryImage
          ? [{ url: product.primaryImage, width: 1200, height: 1500, alt: product.name }]
          : undefined,
      },
    };
  } catch {
    return { title: "Product not found" };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  try {
    product = await productsApi.detail(slug);
  } catch {
    notFound();
  }

  const reviews = await reviewsApi.forProduct(slug).catch(() => []);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((i) => i.image) ?? (product.primaryImage ? [product.primaryImage] : []),
    brand: { "@type": "Brand", name: product.brand.name },
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency,
      price: product.displayPrice,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${SITE.url}/product/${product.slug}`,
    },
    aggregateRating: product.reviewCount
      ? {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.reviewCount,
        }
      : undefined,
  };

  return (
    <div className="navcci-container py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} name={product.name} />
        <ProductBuyBox product={product} />
      </div>

      <ProductDetails product={product} reviews={reviews} />

      {product.related && product.related.length > 0 && (
        <section className="mt-20">
          <h2 className="navcci-heading text-3xl">You May Also Love</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {product.related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <p className="sr-only">Price: {formatCurrency(product.displayPrice)}</p>
    </div>
  );
}
