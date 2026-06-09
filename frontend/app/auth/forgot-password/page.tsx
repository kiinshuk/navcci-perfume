"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { authApi } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authApi.requestReset(data.email);
      setSubmitted(true);
      toast.success("If the email exists, an OTP has been sent.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="navcci-container max-w-md py-20">
      <p className="navcci-eyebrow text-gold-600">Account Recovery</p>
      <h1 className="mt-2 navcci-heading text-4xl">Reset your password</h1>
      {submitted ? (
        <p className="mt-6 text-sm text-muted-foreground">
          We sent a 6-digit code to your email. <Link href="/auth/reset-password" className="underline">Enter it here</Link>.
        </p>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <Label className="mb-2 block normal-case tracking-normal text-xs">Email</Label>
            <Input type="email" autoComplete="email" {...form.register("email")} />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Sending…" : "Send OTP"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remembered it? <Link href="/auth/login" className="underline">Sign in</Link>
          </p>
        </form>
      )}
    </div>
  );
}
