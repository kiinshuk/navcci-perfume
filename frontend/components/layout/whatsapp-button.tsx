"use client";

import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/site";

export function WhatsAppButton() {
  const number = SITE.whatsapp.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Luxe Perfume, I'd like to know more about…")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
