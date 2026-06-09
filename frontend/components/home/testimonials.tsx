const TESTIMONIALS = [
  {
    name: "Ananya P., Mumbai",
    quote:
      "Noir Velours is the most beautiful oud-forward fragrance I have ever worn. The longevity is unreal.",
    role: "Verified buyer",
  },
  {
    name: "Karan S., Delhi",
    quote:
      "A truly luxurious experience from packaging to scent. The team helped me build a perfect wardrobe.",
    role: "Verified buyer",
  },
  {
    name: "Meera R., Bengaluru",
    quote:
      "I bought a discovery set and now own six bottles. The curation is exquisite.",
    role: "Verified buyer",
  },
];

export function Testimonials() {
  return (
    <section className="bg-ink-900 py-24 text-background">
      <div className="luxe-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="luxe-eyebrow text-gold-500">Words From Our Patrons</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">A quiet obsession.</h2>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="border border-background/20 p-8">
              <blockquote className="font-serif text-xl leading-snug">"{t.quote}"</blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-background/70">
                — {t.name} · {t.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
