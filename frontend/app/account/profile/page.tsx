"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const update = useAuthStore((s) => s.updateProfile);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phone: user?.phone ?? "",
    });
  }, [user, form]);

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      await update(data);
      toast.success("Profile updated.");
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  });

  if (!user) {
    return <p className="text-muted-foreground">Please sign in to view your profile.</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Member since {formatDate(user.createdAt)}. Email: {user.email}
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid max-w-xl gap-5 sm:grid-cols-2">
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">First name</Label>
          <Input {...form.register("firstName")} />
        </div>
        <div>
          <Label className="mb-2 block normal-case tracking-normal text-xs">Last name</Label>
          <Input {...form.register("lastName")} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-2 block normal-case tracking-normal text-xs">Phone</Label>
          <Input {...form.register("phone")} />
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  );
}
