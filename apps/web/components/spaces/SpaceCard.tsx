import React from "react";
import Link from "next/link";
import type { SpaceDto } from "@coworkflow/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReservationPill } from "@/components/ui/ReservationPill";
import { Users, ArrowRight, MapPin } from "lucide-react";

export interface SpaceCardProps {
  space: SpaceDto;
}

export function SpaceCard({ space }: SpaceCardProps) {
  const typeDisplay =
    {
      DESK: "Dedicated Desk",
      MEETING_ROOM: "Meeting Room",
      PRIVATE_OFFICE: "Private Office",
    }[space.type] || space.type;

  const isInactive = space.status === "INACTIVE";

  return (
    <Card hoverable className="flex flex-col justify-between h-full bg-[var(--surface-card)]">
      <div>
        {/* Card Header with Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest font-semibold text-[var(--gold-primary)]">
            {typeDisplay}
          </span>
          <ReservationPill status={isInactive ? "inactive" : "available"} size="sm" />
        </div>

        {/* Space Title & Description */}
        <h3 className="font-serif text-xl font-bold tracking-tight text-[var(--text-primary)]">
          {space.name}
        </h3>
        {space.description && (
          <p className="mt-1.5 text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed font-sans">
            {space.description}
          </p>
        )}

        {/* Space Specifications */}
        <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-muted)] font-sans">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Users className="w-3.5 h-3.5 text-[var(--teal-primary)]" />
            <span className="font-medium">
              {space.capacity} {space.capacity === 1 ? "person" : "people"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>SF Flagship</span>
          </div>
        </div>

        {/* Amenities Pills */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {space.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-0.5 rounded-[4px] bg-[var(--surface-muted)] text-[var(--text-secondary)] text-[10px] font-sans border border-[var(--border-default)]"
              >
                {amenity}
              </span>
            ))}
            {space.amenities.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                +{space.amenities.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="mt-6 pt-4 border-t border-[var(--border-default)]">
        {isInactive ? (
          <Button variant="secondary" size="sm" disabled className="w-full">
            Temporarily Unavailable
          </Button>
        ) : (
          <Link href={`/spaces/${space.id}`} className="block w-full">
            <Button variant="primary" size="sm" className="w-full">
              <span>Check Availability</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
