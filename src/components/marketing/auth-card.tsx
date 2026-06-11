"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, registerSchema } from "@/lib/validators";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData);
    const parsed = isRegister
      ? registerSchema.safeParse(payload)
      : loginSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your details.");
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(data.error ?? "Unable to create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Invalid credentials for this workspace.");
        return;
      }

      router.push(result?.url ?? "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach the authentication service. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{isRegister ? "Create your workspace" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isRegister
            ? "Set up ULTRON Signals for your trading desk."
            : "Sign in to review active market signals."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Ajay Sharma" />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="operator@ultronsignals.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="Minimum 8 characters" />
          </div>
          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : null}
            {isLoading
              ? "Please wait"
              : isRegister
                ? "Create account"
                : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have access?" : "New to ULTRON Signals?"}{" "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {isRegister ? "Log in" : "Create account"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
