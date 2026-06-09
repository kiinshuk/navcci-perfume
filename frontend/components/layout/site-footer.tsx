import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

import { FOOTER_LINKS, SITE } from "@/lib/site";
import { NewsletterForm } from "./newsletter-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink-50 dark:bg-ink-900">
      <div className="luxe-container grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" className="font-serif text-3xl">
            Luxe <span className="italic text-gold-500">Perfume</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{SITE.address}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{SITE.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{SITE.phone}</p>
          </div>
        </div>

        <FooterColumn title="Shop" links={FOOTER_LINKS.shop} />
        <FooterColumn title="Service" links={FOOTER_LINKS.care} />
        <FooterColumn title="Legal" links={FOOTER_LINKS.legal} />

        <div className="md:col-span-2 lg:col-span-3">
          <h4 className="luxe-eyebrow">The Atelier Letter</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Subscribe for private launches, atelier stories and an opening 10% off.
          </p>
          <NewsletterForm />
          <div className="mt-6 flex items-center gap-3 text-muted-foreground">
            <Link href={SITE.social.instagram} aria-label="Instagram" className="hover:text-foreground">
              <Instagram className="h-4 w-4" />
            </Link>
            <Link href={SITE.social.pinterest} aria-label="Pinterest" className="hover:text-foreground">
              <span className="text-xs font-medium tracking-widest">PIN</span>
            </Link>
            <Link href={SITE.social.youtube} aria-label="YouTube" className="hover:text-foreground">
              <span className="text-xs font-medium tracking-widest">YT</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="luxe-container flex flex-col items-center justify-between gap-2 py-6 text-[11px] uppercase tracking-[0.2em] text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Crafted in India · GSTIN 27ABCDE1234F1Z5</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="luxe-eyebrow">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
