const PHRASES = [
  "Complimentary shipping above ₹1,500",
  "Atelier consultations by appointment",
  "Free samples with every order",
  "100% authentic, batch-tested",
  "Carbon-neutral delivery in India",
];

export function Marquee() {
  const items = [...PHRASES, ...PHRASES, ...PHRASES];
  return (
    <div className="border-y border-border bg-background py-4 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((p, i) => (
          <span key={i} className="mx-8 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {p} <span className="ml-8 text-gold-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
