export type UUID = string;

export interface Brand {
  id: UUID;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string;
  countryOfOrigin?: string;
  foundedYear?: number | null;
  heroImage?: string | null;
}

export interface Category {
  id: UUID;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  displayOrder?: number;
}

export interface ProductImage {
  id: UUID;
  image: string;
  altText: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Product {
  id: UUID;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  story?: string;
  price: number;
  salePrice: number | null;
  displayPrice: number;
  isOnSale: boolean;
  discountPercent: number;
  currency: string;
  inStock: boolean;
  stockQuantity?: number;
  volumeMl: number;
  concentration: "EDP" | "EDT" | "parfum" | "cologne" | "body";
  gender: "men" | "women" | "unisex" | "neutral";
  fragranceFamily: string;
  topNotes: string[] | { name: string }[];
  heartNotes: string[] | { name: string }[];
  baseNotes: string[] | { name: string }[];
  ingredients?: string;
  brand: Brand;
  categories: Category[];
  primaryImage: string | null;
  images?: ProductImage[];
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isBestseller: boolean;
  isNewArrival: boolean;
  related?: Product[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface CartItem {
  id: UUID;
  product: UUID;
  productName: string;
  productSlug: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  savedForLater: boolean;
  inStock: boolean;
}

export interface Cart {
  id: UUID;
  items: CartItem[];
  coupon: Coupon | null;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  itemCount: number;
  updatedAt: string;
}

export interface Coupon {
  id: UUID;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface Address {
  id: UUID;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface User {
  id: UUID;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  role: "customer" | "staff" | "admin";
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export interface Review {
  id: UUID;
  product: UUID;
  user: UUID;
  userName: string;
  rating: number;
  title: string;
  body: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: UUID;
  product: UUID | null;
  productName: string;
  productSku: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderTimeline {
  id: UUID;
  status: string;
  note: string;
  createdAt: string;
}

export interface Order {
  id: UUID;
  orderNumber: string;
  status: string;
  statusDisplay: string;
  paymentStatus: string;
  email: string;
  phone: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingSameAsShipping: boolean;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  notes: string;
  trackingNumber: string;
  trackingUrl: string;
  courier: string;
  razorpayOrderId: string;
  paidAt: string | null;
  cancelledAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
