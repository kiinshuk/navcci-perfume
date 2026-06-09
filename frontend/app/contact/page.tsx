import type { Metadata } from "next";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

import { SITE } from "@/lib/site";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Luxe Perfume atelier.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="luxe-container grid gap-12 py-12 lg:grid-cols-2">
      <div>
        <p className="luxe-eyebrow text-gold-600">The Atelier</p>
        <h1 className="mt-2 luxe-heading text-4xl">We'd love to hear from you.</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, bespoke consultations or press — our team replies within one
          business day.
        </p>

        <ul className="mt-10 space-y-5 text-sm">
          <li className="flex items-start gap-3">
            <MapPin className="mt-1 h-4 w-4 text-foreground" />
            <span>{SITE.address}</span>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-1 h-4 w-4 text-foreground" />
            <a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-1 h-4 w-4 text-foreground" />
            <a href={`tel:${SITE.phone}`} className="hover:underline">{SITE.phone}</a>
          </li>
          <li className="flex items-start gap-3">
            <MessageCircle className="mt-1 h-4 w-4 text-foreground" />
            <a
              href={`https://wa.me/${SITE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="hover:underline"
            >
              Chat on WhatsApp
            </a>
          </li>
        </ul>

        <div className="mt-10 aspect-[4/3] w-full overflow-hidden">
          <iframe
            title="Luxe Perfume Atelier Location"
            src="https://maps.google.com/maps?q=Mumbai%20400001&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            loading="lazy"
            className="border-0"
          />
        </div>
      </div>

      <div>
        <ContactForm />
      </div>
    </div>
  );
}
