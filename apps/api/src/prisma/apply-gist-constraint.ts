import { prisma } from "./client.js";

export async function applyGistConstraint(): Promise<void> {
  // 1. Enable btree_gist extension
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);

  // 2. Add during_range generated stored column with half-open bounds [start_at, end_at)
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reservation' AND column_name = 'during_range'
      ) THEN
        ALTER TABLE "reservation"
          ADD COLUMN "during_range" tstzrange
          GENERATED ALWAYS AS (tstzrange("start_at", "end_at", '[)')) STORED;
      END IF;
    END $$;
  `);

  // 3. Create GiST exclusion constraint scoped to active CONFIRMED reservations per space
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reservation_no_overlap'
      ) THEN
        ALTER TABLE "reservation"
          ADD CONSTRAINT "reservation_no_overlap"
          EXCLUDE USING gist (
            "space_id" WITH =,
            "during_range" WITH &&
          )
          WHERE ("status" = 'CONFIRMED');
      END IF;
    END $$;
  `);
}

// Allow direct CLI execution
if (process.argv[1]?.includes("apply-gist-constraint")) {
  applyGistConstraint()
    .then(() => {
      console.log("PostgreSQL GiST exclusion constraint applied successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to apply GiST exclusion constraint:", err);
      process.exit(1);
    });
}
