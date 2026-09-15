"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      success("Welcome back", `Logged in as ${user.firstName} ${user.lastName}`);

      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setErrorMsg("Too many login attempts. Please wait a minute and try again.");
        } else if (err.code === "INVALID_CREDENTIALS") {
          setErrorMsg("Invalid email or password. Please verify your credentials.");
        } else if (err.code === "USER_DEACTIVATED") {
          setErrorMsg("Your account has been deactivated. Please contact support.");
        } else {
          setErrorMsg(err.message || "Failed to sign in.");
        }
      } else {
        setErrorMsg("Network error. Please check your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-[6px] bg-[var(--gold-primary)] text-white font-bold text-base mb-3 shadow-xs">
            CW
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Sign in to CoWorkFlow
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-sans">
            Access your workspace reservations and schedule
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            {errorMsg && (
              <div
                role="alert"
                className="mb-5 p-3.5 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-[var(--terracotta-primary)] text-xs flex items-start gap-2.5 leading-relaxed"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" requiredIndicator>
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="maria@coworkflow.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    hasError={!!errorMsg}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="password" requiredIndicator>
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  hasError={!!errorMsg}
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--gold-primary)] hover:text-[var(--gold-hover)] underline underline-offset-2 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
