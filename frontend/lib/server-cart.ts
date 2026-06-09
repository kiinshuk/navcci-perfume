import { cookies } from "next/headers";

import { api, getAccessToken } from "./api";
import type { Cart } from "@/types";

const SESSION_COOKIE = "luxe.session";

export async function getCart(): Promise<Cart | null> {
  const token = getAccessToken();
  if (token) {
    try {
      const { data } = await api.get<Cart>("/cart/");
      return data;
    } catch {
      return null;
    }
  }
  // Anonymous: try to fetch by session key from cookie
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!session) return null;
  try {
    const { data } = await api.get<Cart>("/cart/", { headers: { "X-Session-Key": session } });
    return data;
  } catch {
    return null;
  }
}
