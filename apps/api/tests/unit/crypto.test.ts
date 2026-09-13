import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateRawToken,
  hashToken,
} from "../../src/shared/utils/crypto.js";

describe("crypto utilities", () => {
  describe("Argon2id hashing", () => {
    it("hashes and correctly verifies passwords", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.startsWith("$argon2id$")).toBe(true);

      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword(hash, "WrongPassword!");
      expect(isInvalid).toBe(false);
    });
  });

  describe("Token hashing and generation", () => {
    it("generates 64-character hex raw tokens", () => {
      const token1 = generateRawToken();
      const token2 = generateRawToken();

      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toEqual(token2);
    });

    it("generates deterministic SHA-256 hashes for tokens", () => {
      const rawToken = generateRawToken();
      const hash1 = hashToken(rawToken);
      const hash2 = hashToken(rawToken);

      expect(hash1).toHaveLength(64);
      expect(hash1).toEqual(hash2);
    });
  });
});
