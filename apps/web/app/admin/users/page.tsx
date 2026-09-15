"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserDto, ApiResponse, UserStatus } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/date-utils";
import { Search, Power } from "lucide-react";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () =>
      apiClient<ApiResponse<UserDto[]>>("/admin/users", {
        params: {
          pageSize: 50,
        },
      }),
  });

  const users = data?.data || [];

  const toggleUserStatusMutation = useMutation({
    mutationFn: async (user: UserDto) => {
      const nextStatus: UserStatus = user.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
      return apiClient<ApiResponse<UserDto>>(`/admin/users/${user.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
    },
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      success(
        "User Status Updated",
        `${user.firstName} ${user.lastName} is now ${
          user.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
        }.`
      );
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        toastError("Operation Failed", err.message);
      } else {
        toastError("Error", "Network error updating user status.");
      }
    },
  });

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = `${u.firstName} ${u.lastName}`.toLowerCase();
    const email = u.email.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
            Identity & Access
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
            Member Management
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Audit registered members, inspect role assignments, and manage account authorization
            status.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5"
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          Total: <strong className="text-[var(--text-primary)]">{filteredUsers.length}</strong>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Joined Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="p-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isDeactivated = user.status === "DEACTIVATED";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                        <div className="font-semibold text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] font-mono">
                          {user.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-muted)] text-[var(--text-primary)] font-mono text-[10px] font-bold border border-[var(--border-default)]">
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <ReservationPill status={isDeactivated ? "inactive" : "active"} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant={isDeactivated ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => toggleUserStatusMutation.mutate(user)}
                          isLoading={toggleUserStatusMutation.isPending}
                        >
                          <Power className="w-3.5 h-3.5 mr-1" />
                          <span>{isDeactivated ? "Activate" : "Deactivate"}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                    No users match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
