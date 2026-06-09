"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { api, extractErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Address } from "@/types";

export default function AddressesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.get<Address[]>("/auth/addresses/")).data,
  });
  const [adding, setAdding] = useState(false);

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/auth/addresses/${id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address removed.");
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  return (
    <div>
      <h1 className="font-serif text-3xl">Addresses</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your shipping and billing addresses.</p>

      <div className="mt-8 space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          data?.map((a) => (
            <div key={a.id} className="flex items-start justify-between border border-border p-4">
              <div>
                <p className="font-medium">{a.fullName} <span className="text-xs uppercase tracking-widest text-muted-foreground">· {a.label}</span></p>
                <p className="text-sm text-muted-foreground">
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postalCode}, {a.country}<br />
                  {a.phone}
                </p>
                <div className="mt-2 flex gap-3 text-xs uppercase tracking-widest text-gold-700">
                  {a.isDefaultShipping && <span>Default Shipping</span>}
                  {a.isDefaultBilling && <span>Default Billing</span>}
                </div>
              </div>
              <button onClick={() => remove.mutate(a.id)} className="text-muted-foreground hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <Button onClick={() => setAdding(!adding)} className="mt-6" variant="outline">
        <Plus className="h-4 w-4" /> Add new address
      </Button>

      {adding && <AddressForm onDone={() => { setAdding(false); qc.invalidateQueries({ queryKey: ["addresses"] }); }} />}
    </div>
  );
}

function AddressForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "",
    country: "IN", label: "Home", isDefaultShipping: true, isDefaultBilling: false,
  });
  const [loading, setLoading] = useState(false);

  const onChange = (key: keyof typeof form, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/addresses/", form);
      toast.success("Address added.");
      onDone();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4 border border-border p-4 sm:grid-cols-2">
      <Field label="Label"><Input value={form.label} onChange={(e) => onChange("label", e.target.value)} /></Field>
      <Field label="Full name"><Input value={form.fullName} onChange={(e) => onChange("fullName", e.target.value)} required /></Field>
      <Field label="Phone"><Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} required /></Field>
      <Field label="Country"><Input value={form.country} onChange={(e) => onChange("country", e.target.value)} /></Field>
      <Field label="Address line 1" className="sm:col-span-2"><Input value={form.line1} onChange={(e) => onChange("line1", e.target.value)} required /></Field>
      <Field label="Address line 2" className="sm:col-span-2"><Input value={form.line2} onChange={(e) => onChange("line2", e.target.value)} /></Field>
      <Field label="City"><Input value={form.city} onChange={(e) => onChange("city", e.target.value)} required /></Field>
      <Field label="State"><Input value={form.state} onChange={(e) => onChange("state", e.target.value)} required /></Field>
      <Field label="Postal code"><Input value={form.postalCode} onChange={(e) => onChange("postalCode", e.target.value)} required /></Field>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Checkbox id="ds" checked={form.isDefaultShipping} onCheckedChange={(v) => onChange("isDefaultShipping", Boolean(v))} />
        <Label htmlFor="ds" className="normal-case tracking-normal text-sm">Default shipping</Label>
      </div>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-2 block normal-case tracking-normal text-xs">{label}</Label>
      {children}
    </div>
  );
}
