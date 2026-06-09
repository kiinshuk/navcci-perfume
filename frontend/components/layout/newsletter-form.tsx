"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, extractErrorMessage } from "@/lib/api";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/newsletter/subscribe/", { email });
      toast.success("Welcome to the Atelier Letter. Check your inbox.");
      setEmail("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Subscription failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <Input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email address"
      />
      <Button type="submit" variant="default" size="default" disabled={loading}>
        {loading ? "…" : "Subscribe"}
      </Button>
    </form>
  );
}
