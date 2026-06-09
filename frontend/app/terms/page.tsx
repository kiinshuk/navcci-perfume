import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <Policy>
      <h1>Terms &amp; Conditions</h1>
      <p>Last updated: 1 January 2026.</p>
      <p>By using luxeperfume.in you agree to the following terms.</p>
      <h2>Orders &amp; pricing</h2>
      <p>All prices are inclusive of GST. We reserve the right to refuse or cancel orders in cases of pricing errors or suspected fraud.</p>
      <h2>Shipping</h2>
      <p>We ship across India. Delivery times are estimates and may vary due to weather, customs or carrier delays.</p>
      <h2>Intellectual property</h2>
      <p>All content on this site, including text, images and trademarks, is owned by Luxe Perfume or our licensors.</p>
      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, Luxe Perfume is not liable for any indirect, incidental or consequential damages.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the jurisdiction of Mumbai courts.</p>
    </Policy>
  );
}
