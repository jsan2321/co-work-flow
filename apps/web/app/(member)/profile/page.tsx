"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { formatDate } from "@/lib/date-utils";
import { Shield, Calendar } from "lucide-react";
import type { ApiResponse, UserDto } from "@coworkflow/types";

export default function ProfilePage() {
  const { user, refreshSession } = useAuth();
  const { success, error: toastError } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toastError("Validation Error", "First and last name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient<ApiResponse<UserDto>>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      await refreshSession();
      success("Profile Updated", "Your name has been updated successfully.");
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        toastError("Update Failed", err.message || "Could not update profile.");
      } else {
        toastError("Error", "Network error. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
          Member Profile
        </h1>
        <p className="text-xs text-[var(--text-secondary)] font-sans mt-1">
          Manage your personal details, role credentials, and session state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Account Summary Card */}
        <div className="md:col-span-1">
          <Card>
            <div className="text-center pb-6 border-b border-[var(--border-default)]">
              <div className="w-16 h-16 rounded-full bg-[var(--gold-soft)] text-[var(--gold-hover)] flex items-center justify-center font-bold text-xl mx-auto mb-3 font-serif">
                {user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
              </div>
              <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">{user?.email}</p>
              <div className="mt-3">
                <ReservationPill
                  status={user?.status === "ACTIVE" ? "active" : "inactive"}
                  size="sm"
                />
              </div>
            </div>

            <div className="pt-4 space-y-3 text-xs text-[var(--text-secondary)] font-sans">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Role
                </span>
                <span className="font-semibold text-[var(--text-primary)] font-mono">
                  {user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Member Since
                </span>
                <span className="font-medium text-[var(--text-primary)]">
                  {user?.createdAt ? formatDate(user.createdAt) : "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Profile Edit Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
              <CardDescription>
                Update the display name associated with your workspace reservations.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" requiredIndicator>
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" requiredIndicator>
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-[var(--surface-muted)] cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-[var(--text-muted)] font-sans">
                    Email address changes require administrative verification.
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end">
                  <Button type="submit" variant="primary" size="md" isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
