import { prisma } from "./client.js";

export async function applyAuditImmutability(): Promise<void> {
  // 1. Create function that rejects UPDATE and DELETE operations on audit_log
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION prevent_audit_log_modification()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'Audit logs are immutable. UPDATE and DELETE operations are forbidden.';
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Drop existing trigger if present
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS audit_log_immutability_trg ON "audit_log";
  `);

  // 3. Attach trigger to audit_log table
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER audit_log_immutability_trg
    BEFORE UPDATE OR DELETE ON "audit_log"
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_log_modification();
  `);
}

if (process.argv[1]?.includes("apply-audit-immutability")) {
  applyAuditImmutability()
    .then(() => {
      console.log("PostgreSQL audit log immutability trigger applied successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to apply audit immutability trigger:", err);
      process.exit(1);
    });
}
