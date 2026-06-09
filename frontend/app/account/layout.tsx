import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/account-sidebar";

export const metadata: Metadata = { title: "My Account" };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="luxe-container grid gap-10 py-12 lg:grid-cols-[260px_1fr]">
      <AccountSidebar />
      <section>{children}</section>
    </div>
  );
}
