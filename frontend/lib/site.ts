export const SITE = {
  name: "Navcci Perfume",
  tagline: "The Art of Fine Fragrance",
  description:
    "Discover hand-crafted niche perfumes from the world's most prestigious houses. Complimentary shipping across India on orders above ₹1,500.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://navcciperfume.in",
  ogImage: "/og.jpg",
  email: "hello@navcciperfume.in",
  phone: "+91 99999 99999",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919999999999",
  address: "Navcci Perfume Atelier, Mumbai 400001, India",
  social: {
    instagram: "https://instagram.com/navcciperfume",
    pinterest: "https://pinterest.com/navcciperfume",
    youtube: "https://youtube.com/@navcciperfume",
  },
};

export const NAV = [
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/shop?filter=new" },
  { label: "Bestsellers", href: "/shop?filter=bestseller" },
  { label: "Discovery", href: "/shop?category=discovery-sets" },
  { label: "Story", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Perfumes", href: "/shop" },
    { label: "New Arrivals", href: "/shop?filter=new" },
    { label: "Bestsellers", href: "/shop?filter=bestseller" },
    { label: "Oud Collection", href: "/shop?category=oud-collection" },
    { label: "Discovery Sets", href: "/shop?category=discovery-sets" },
  ],
  care: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Shipping Policy", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "FAQ", href: "/contact#faq" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Refund Policy", href: "/returns" },
  ],
};
