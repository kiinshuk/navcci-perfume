"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api, extractErrorMessage } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post("/contact/", data);
      toast.success("Thank you. Our team will respond shortly.");
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-border p-6">
      <h2 className="font-serif text-2xl">Send us a note</h2>
      <Field label="Name">
        <Input {...register("name")} />
        <Err msg={formState.errors.name?.message} />
      </Field>
      <Field label="Email">
        <Input type="email" {...register("email")} />
        <Err msg={formState.errors.email?.message} />
      </Field>
      <Field label="Subject">
        <Input {...register("subject")} />
        <Err msg={formState.errors.subject?.message} />
      </Field>
      <Field label="Message">
        <Textarea rows={6} {...register("message")} />
        <Err msg={formState.errors.message?.message} />
      </Field>
      <Button type="submit" size="lg" disabled={loading}>{loading ? "Sending…" : "Send Message"}</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block normal-case tracking-normal text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}
