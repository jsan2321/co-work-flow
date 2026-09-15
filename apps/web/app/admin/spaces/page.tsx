"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceDto, ApiResponse } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { SpaceFormModal } from "@/components/admin/SpaceFormModal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Plus, Edit2, Power, Search } from "lucide-react";

export default function AdminSpacesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [search, setSearch] = useState("");
  const [selectedSpace, setSelectedSpace] = useState<SpaceDto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => apiClient<ApiResponse<SpaceDto[]>>("/spaces"),
  });

  const spaces = data?.data || [];
  const defaultLocationId = spaces[0]?.locationId;

  const toggleStatusMutation = useMutation({
    mutationFn: async (space: SpaceDto) => {
      const nextStatus = space.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      return apiClient<ApiResponse<SpaceDto>>(`/admin/spaces/${space.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
    },
    onSuccess: (_, space) => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      success(
        "Status Updated",
        `${space.name} is now ${space.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"}.`
      );
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        toastError("Failed", err.message);
      } else {
        toastError("Error", "Network error updating status.");
      }
    },
  });

  const filteredSpaces = spaces.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--gold-primary)] font-semibold">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-0.5">
            Workspaces & Suites
          </h1>
          <p className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Create new rooms, update capacity, and toggle operational availability.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setSelectedSpace(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Workspace</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <Input
            placeholder="Search spaces by name, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9.5"
          />
        </div>
        <span className="text-xs text-[var(--text-secondary)]">
          Total: <strong className="text-[var(--text-primary)]">{filteredSpaces.length}</strong>
        </span>
      </div>

      {/* Operational Table */}
      <div className="rounded-[8px] bg-[var(--surface-card)] border border-[var(--border-default)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--surface-subtle)] text-[var(--text-muted)] font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Space Name</th>
                <th className="py-3 px-4 font-semibold">Type</th>
                <th className="py-3 px-4 font-semibold">Capacity</th>
                <th className="py-3 px-4 font-semibold">Amenities</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="p-4">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredSpaces.length > 0 ? (
                filteredSpaces.map((space) => {
                  const isInactive = space.status === "INACTIVE";

                  return (
                    <tr
                      key={space.id}
                      className="hover:bg-[var(--surface-subtle)] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-[var(--text-primary)]">
                        <div className="font-semibold text-sm">{space.name}</div>
                        {space.description && (
                          <div className="text-[11px] text-[var(--text-muted)] line-clamp-1 max-w-xs">
                            {space.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] uppercase">{space.type}</td>
                      <td className="py-3.5 px-4 font-medium">
                        {space.capacity} {space.capacity === 1 ? "seat" : "seats"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {space.amenities?.slice(0, 2).map((a) => (
                            <span
                              key={a}
                              className="px-1.5 py-0.5 rounded-[3px] bg-[var(--surface-muted)] text-[10px]"
                            >
                              {a}
                            </span>
                          ))}
                          {(space.amenities?.length || 0) > 2 && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              +{(space.amenities?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <ReservationPill status={isInactive ? "inactive" : "active"} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSpace(space);
                              setIsFormOpen(true);
                            }}
                            title="Edit workspace properties"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant={isInactive ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => toggleStatusMutation.mutate(space)}
                            isLoading={toggleStatusMutation.isPending}
                            title={isInactive ? "Activate space" : "Deactivate space"}
                          >
                            <Power className="w-3.5 h-3.5 mr-1" />
                            <span>{isInactive ? "Activate" : "Deactivate"}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-muted)]">
                    No workspaces found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <SpaceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        space={selectedSpace}
        defaultLocationId={defaultLocationId}
      />
    </div>
  );
}
