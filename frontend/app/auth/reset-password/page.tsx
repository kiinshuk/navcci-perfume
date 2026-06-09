"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { authApi } from "@/lib/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    email: z.string().email(),
    otp: z.string().length(6, "Enter the 6-digit OTP"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authApi.confirmReset(data.email, data.otp, data.newPassword);
      toast.success("Password updated. Please sign in.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="navcci-container max-w-md py-20">
      <p className="navcci-eyebrow text-gold-600">Account Recovery</p>
      <h1 className="mt-2 navcci-heading text-4xl">Enter OTP</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Email</Label>
          <Input type="email" {...form.register("email")} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">6-digit OTP</Label>
          <Input inputMode="numeric" maxLength={6} {...form.register("otp")} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">New password</Label>
          <Input type="password" {...form.register("newPassword")} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Confirm new password</Label>
          <Input type="password" {...form.register("confirmPassword")} />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Updating…" : "Update Password"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="underline">Back to sign in</Link>
        </p>
      </form>
    </div>
  );
}
