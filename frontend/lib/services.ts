import { api, clearTokens, setTokens } from "./api";
import type { Cart, Order, PaginatedResponse, Product, User, Wishlist } from "@/types";

export const productsApi = {
  list: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Product>>("/products/", { params }).then((r) => r.data),
  detail: (slug: string) => api.get<Product>(`/products/${slug}/`).then((r) => r.data),
  featured: () => api.get<Product[]>("/products/featured/").then((r) => r.data),
  bestsellers: () => api.get<Product[]>("/products/bestsellers/").then((r) => r.data),
  newArrivals: () => api.get<Product[]>("/products/new_arrivals/").then((r) => r.data),
  search: (q: string) => api.get<{ results: Product[] }>("/search/", { params: { q } }).then((r) => r.data),
};

export const brandsApi = {
  list: () => api.get<PaginatedResponse<any>>("/brands/").then((r) => r.data.results),
};

export const categoriesApi = {
  list: () => api.get<any[]>("/categories/").then((r) => r.data),
};

export const authApi = {
  register: (payload: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    passwordConfirm: string;
  }) =>
    api
      .post<{ user: User; access: string; refresh: string }>("/auth/register/", payload)
      .then((r) => r.data),
  login: (identifier: string, password: string) =>
    api
      .post<{ user: User; access: string; refresh: string }>("/auth/login/", {
        email: identifier,
        password,
      })
      .then((r) => r.data),
  logout: () =>
    api
      .post("/auth/logout/", { refresh: typeof window !== "undefined" ? window.localStorage.getItem("luxe.refresh") : null })
      .finally(() => clearTokens()),
  me: () => api.get<User>("/auth/profile/").then((r) => r.data),
  changePassword: (current: string, next: string) =>
    api.post("/auth/password/change/", { current_password: current, new_password: next }),
  requestReset: (email: string) => api.post("/auth/password/reset/", { email }),
  confirmReset: (email: string, otp: string, newPassword: string) =>
    api.post("/auth/password/reset/confirm/", {
      email,
      otp,
      new_password: newPassword,
    }),
  updateProfile: (payload: { firstName: string; lastName: string; phone: string }) =>
    api.patch<User>("/auth/profile/", payload).then((r) => r.data),
};

export function persistAuth(access: string, refresh: string) {
  setTokens(access, refresh);
}

export const cartApi = {
  get: () => api.get<Cart>("/cart/").then((r) => r.data),
  add: (productId: string, quantity = 1) =>
    api.post<Cart>("/cart/items/", { product_id: productId, quantity }).then((r) => r.data),
  update: (itemId: string, quantity: number) =>
    api.patch<Cart>(`/cart/items/${itemId}/`, { quantity }).then((r) => r.data),
  remove: (itemId: string) => api.delete<Cart>(`/cart/items/${itemId}/`).then((r) => r.data),
  clear: () => api.delete<Cart>("/cart/").then((r) => r.data),
  applyCoupon: (code: string) => api.post<Cart>("/cart/coupon/", { code }).then((r) => r.data),
  removeCoupon: () => api.delete<Cart>("/cart/coupon/").then((r) => r.data),
  saveForLater: (itemId: string) => api.post<Cart>(`/cart/items/${itemId}/save-for-later/`).then((r) => r.data),
  moveToCart: (itemId: string) =>
    api.delete<Cart>(`/cart/items/${itemId}/save-for-later/`).then((r) => r.data),
};

export const wishlistApi = {
  get: () => api.get<Wishlist>("/auth/wishlist/").then((r) => r.data),
  add: (productId: string) => api.post<Wishlist>("/auth/wishlist/", { product_id: productId }).then((r) => r.data),
  remove: (productId: string) => api.delete<Wishlist>("/auth/wishlist/", { data: { product_id: productId } }).then((r) => r.data),
};

export const orderApi = {
  checkout: (payload: Record<string, unknown>) =>
    api
      .post<{ order: Order; razorpay: { id: string; amount: number; currency: string; key_id: string } }>(
        "/checkout/",
        payload
      )
      .then((r) => r.data),
  capturePayment: (payload: { orderId: string; paymentId: string; signature: string }) =>
    api.post<{ success: boolean; status: string }>("/payments/capture/", payload).then((r) => r.data),
  list: () => api.get<PaginatedResponse<Order>>("/orders/").then((r) => r.data.results ?? []),
  detail: (orderNumber: string) => api.get<Order>(`/orders/${orderNumber}/`).then((r) => r.data),
};

export const reviewsApi = {
  forProduct: (slug: string) =>
    api
      .get<PaginatedResponse<any>>(`/products/${slug}/reviews/`)
      .then((r) => r.data.results ?? []),
  create: (slug: string, payload: { rating: number; title: string; body: string }) =>
    api.post(`/products/${slug}/reviews/`, payload).then((r) => r.data),
};
