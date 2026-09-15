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
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { ApiError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPasswordValid = password.length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg("Password must be at least 10 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      success("Account created", `Welcome to CoWorkFlow, ${user.firstName}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === "EMAIL_ALREADY_EXISTS") {
          setErrorMsg("An account with this email address already exists.");
        } else if (err.code === "VALIDATION_ERROR" && err.details?.length) {
          setErrorMsg(err.details.map((d) => d.issue).join(", "));
        } else {
          setErrorMsg(err.message || "Failed to create account.");
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
            Join CoWorkFlow
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)] font-sans">
            Reserve workspaces, quiet desks, and meeting suites with guaranteed zero double-bookings
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" requiredIndicator>
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Maria"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" requiredIndicator>
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Santos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" requiredIndicator>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="maria@coworkflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password" requiredIndicator>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {isPasswordValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-primary)]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--border-strong)]" />
                  )}
                  <span
                    className={
                      isPasswordValid
                        ? "text-[var(--green-primary)] font-medium"
                        : "text-[var(--text-muted)]"
                    }
                  >
                    Minimum 10 characters (NIST SP 800-63B compliant)
                  </span>
                </div>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--gold-primary)] hover:text-[var(--gold-hover)] underline underline-offset-2 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
