import type { Metadata } from "next";
import Policy from "../policy-layout";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <Policy>
      <h1>Privacy Policy</h1>
      <p>Last updated: 1 January 2026.</p>
      <p>
        Navcci Perfume ("we", "us") respects your privacy. This policy explains what data
        we collect, why, and how we keep it safe.
      </p>
      <h2>Data we collect</h2>
      <ul>
        <li>Account information (name, email, phone) when you register.</li>
        <li>Order and shipping information to fulfil your purchase.</li>
        <li>Device, IP and usage data via cookies and analytics tools.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To process orders, provide customer support, prevent fraud, personalise your experience, and improve our services.</p>
      <h2>Payments</h2>
      <p>All card data is handled directly by Razorpay. We never store your full card number or CVV.</p>
      <h2>Your rights</h2>
      <p>You can request access, correction or deletion of your personal data by emailing hello@navcciperfume.in.</p>
      <h2>Contact</h2>
      <p>For privacy queries, contact our Data Protection Officer at hello@navcciperfume.in.</p>
    </Policy>
  );
}
