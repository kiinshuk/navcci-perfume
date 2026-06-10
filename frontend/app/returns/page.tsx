import type { Metadata } from "next";
import Policy from "../policy-layout";

export const metadata: Metadata = { title: "Return & Refund Policy", alternates: { canonical: "/returns" } };

export default function ReturnsPage() {
  return (
    <Policy>
      <h1>Return &amp; Refund Policy</h1>
      <p>Your satisfaction is our priority. If something isn't right, we're here to help.</p>
      <h2>Damaged or incorrect orders</h2>
      <p>
        If your order arrives damaged or incorrect, please contact us within 48 hours of
        delivery at hello@navcciperfume.in with photographs. We'll arrange a free return
        and ship a replacement at no additional cost.
      </p>
      <h2>Change of mind</h2>
      <p>
        For unopened, sealed products in original packaging, we accept returns within 14
        days of delivery. A 10% restocking fee applies.
      </p>
      <h2>Non-returnable items</h2>
      <ul>
        <li>Discovery sets and minis</li>
        <li>Personalised or engraved bottles</li>
        <li>Items marked as final sale</li>
      </ul>
      <h2>Refunds</h2>
      <p>Refunds are processed within 5 – 7 business days after we receive the returned item.</p>
    </Policy>
  );
}
