"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    username: z.string().min(3),
    phone: z.string().min(10),
    password: z.string().min(8, "Password must be at least 8 characters"),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Passwords do not match.",
  });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await register(data);
      toast.success("Welcome to Navcci Perfume.");
      router.push("/account/profile");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="navcci-container max-w-xl py-20">
      <p className="navcci-eyebrow text-gold-600">Atelier Access</p>
      <h1 className="mt-2 navcci-heading text-4xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Unlock member benefits: early access, exclusive launches and a complimentary 5ml sample with every order.
      </p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">First name</Label>
          <Input {...form.register("firstName")} />
          <Error msg={form.formState.errors.firstName?.message} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Last name</Label>
          <Input {...form.register("lastName")} />
          <Error msg={form.formState.errors.lastName?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-2 block normal-case tracking-normal text-xs">Email</Label>
          <Input type="email" autoComplete="email" {...form.register("email")} />
          <Error msg={form.formState.errors.email?.message} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Username</Label>
          <Input {...form.register("username")} />
          <Error msg={form.formState.errors.username?.message} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Phone</Label>
          <Input {...form.register("phone")} />
          <Error msg={form.formState.errors.phone?.message} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Password</Label>
          <Input type="password" autoComplete="new-password" {...form.register("password")} />
          <Error msg={form.formState.errors.password?.message} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Confirm password</Label>
          <Input type="password" autoComplete="new-password" {...form.register("passwordConfirm")} />
          <Error msg={form.formState.errors.passwordConfirm?.message} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating…" : "Create Account"}
          </Button>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Already a member? <Link href="/auth/login" className="underline">Sign in</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

function Error({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-red-600">{msg}</p>;
}
