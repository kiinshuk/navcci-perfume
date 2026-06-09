"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  identifier: z.string().min(3, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account/profile";
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const user = await login(data.identifier, data.password);
      toast.success(`Welcome back, ${user.firstName || user.username}.`);
      router.push(next);
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Invalid credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="navcci-container max-w-md py-20">
      <p className="navcci-eyebrow text-gold-600">Welcome back</p>
      <h1 className="mt-2 navcci-heading text-4xl">Sign in</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <Label htmlFor="identifier" className="mb-2 block normal-case tracking-normal text-xs">Email or username</Label>
          <Input id="identifier" autoComplete="email" {...form.register("identifier")} />
          {form.formState.errors.identifier && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.identifier.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password" className="mb-2 block normal-case tracking-normal text-xs">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
          <Link href="/auth/register" className="text-muted-foreground hover:text-foreground">
            Create an account
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
