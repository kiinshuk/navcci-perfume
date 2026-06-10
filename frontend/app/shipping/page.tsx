import type { Metadata } from "next";
import Policy from "../policy-layout";

export const metadata: Metadata = { title: "Shipping Policy", alternates: { canonical: "/shipping" } };

export default function ShippingPage() {
  return (
    <Policy>
      <h1>Shipping Policy</h1>
      <p>We partner with leading logistics providers to deliver your order safely across India.</p>
      <h2>Delivery times</h2>
      <ul>
        <li>Metro cities: 2 – 4 business days</li>
        <li>Tier-2 cities: 4 – 6 business days</li>
        <li>Remote PIN codes: 6 – 8 business days</li>
      </ul>
      <h2>Shipping charges</h2>
      <p>Complimentary shipping on orders above ₹1,500. A flat ₹99 fee applies otherwise.</p>
      <h2>Order tracking</h2>
      <p>You'll receive an email with tracking details as soon as your order leaves the atelier.</p>
      <h2>International shipping</h2>
      <p>Currently we ship within India. International shipping is on the roadmap for 2026.</p>
    </Policy>
  );
}
