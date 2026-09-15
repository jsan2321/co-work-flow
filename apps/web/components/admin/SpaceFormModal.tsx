"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SpaceDto, SpaceType, ApiResponse } from "@coworkflow/types";
import { apiClient, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toast";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export interface SpaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  space?: SpaceDto | null;
  defaultLocationId?: string;
}

export function SpaceFormModal({ isOpen, onClose, space, defaultLocationId }: SpaceFormModalProps) {
  const queryClient = useQueryClient();
  const { success } = useToast();

  const isEditing = !!space;

  const [name, setName] = useState("");
  const [type, setType] = useState<SpaceType>("DESK");
  const [capacity, setCapacity] = useState<number>(1);
  const [description, setDescription] = useState("");
  const [amenitiesInput, setAmenitiesInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (space) {
      setName(space.name);
      setType(space.type);
      setCapacity(space.capacity);
      setDescription(space.description || "");
      setAmenitiesInput(space.amenities ? space.amenities.join(", ") : "");
    } else {
      setName("");
      setType("DESK");
      setCapacity(1);
      setDescription("");
      setAmenitiesInput("");
    }
    setErrorMsg(null);
  }, [space, isOpen]);

  const mutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const amenities = amenitiesInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      if (isEditing) {
        return apiClient<ApiResponse<SpaceDto>>(`/admin/spaces/${space.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: name.trim(),
            type,
            capacity: Number(capacity),
            description: description.trim() || undefined,
            amenities,
          }),
        });
      } else {
        const locId = defaultLocationId;
        if (!locId) {
          throw new Error("No location configured for space creation.");
        }

        return apiClient<ApiResponse<SpaceDto>>("/admin/spaces", {
          method: "POST",
          body: JSON.stringify({
            locationId: locId,
            name: name.trim(),
            type,
            capacity: Number(capacity),
            description: description.trim() || undefined,
            amenities,
          }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      success(
        isEditing ? "Space Updated" : "Space Created",
        `${name} has been successfully saved.`
      );
      onClose();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Operation failed.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to save space.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Space name is required.");
      return;
    }
    if (capacity < 1) {
      setErrorMsg("Capacity must be at least 1.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Space" : "New Workspace"}
      description="Configure workspace properties, capacity limits, and amenity fixtures."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {errorMsg && (
          <div className="p-3 rounded-[6px] bg-[var(--terracotta-soft)] border border-[var(--terracotta-primary)]/30 text-[var(--terracotta-primary)] text-xs">
            {errorMsg}
          </div>
        )}

        <div>
          <Label htmlFor="space-name" requiredIndicator>
            Space Name
          </Label>
          <Input
            id="space-name"
            placeholder="e.g. Focus Pod B, Boardroom Meridian"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="space-type" requiredIndicator>
              Space Type
            </Label>
            <select
              id="space-type"
              value={type}
              onChange={(e) => setType(e.target.value as SpaceType)}
              className="w-full h-11 px-3.5 rounded-[6px] bg-[var(--surface-card)] text-[var(--text-primary)] text-sm font-sans border border-[var(--border-default)] hover:border-[var(--border-strong)] focus-visible:border-[var(--gold-primary)] focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)]"
            >
              <option value="DESK">Dedicated Desk</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="PRIVATE_OFFICE">Private Office</option>
            </select>
          </div>

          <div>
            <Label htmlFor="space-capacity" requiredIndicator>
              Capacity (Seats)
            </Label>
            <Input
              id="space-capacity"
              type="number"
              min={1}
              max={100}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="space-description">Description</Label>
          <textarea
            id="space-description"
            rows={3}
            placeholder="Acoustic specs, natural lighting, recommended team size..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-[6px] bg-[var(--surface-card)] text-[var(--text-primary)] text-sm font-sans border border-[var(--border-default)] hover:border-[var(--border-strong)] focus-visible:border-[var(--gold-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--gold-primary)]"
          />
        </div>

        <div>
          <Label htmlFor="space-amenities">Amenities (comma-separated)</Label>
          <Input
            id="space-amenities"
            placeholder="e.g. 4K Display, Whiteboard, Standing Desk, Ergonomic Chair"
            value={amenitiesInput}
            onChange={(e) => setAmenitiesInput(e.target.value)}
          />
        </div>

        <div className="pt-4 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={mutation.isPending}>
            {isEditing ? "Save Changes" : "Create Space"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
