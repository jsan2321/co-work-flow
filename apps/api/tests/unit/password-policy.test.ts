import { describe, it, expect } from "vitest";
import { validatePasswordPolicy } from "../../src/shared/utils/password-policy.js";
import { ValidationError } from "../../src/shared/errors/app-error.js";

describe("validatePasswordPolicy", () => {
  it("accepts passwords that meet length and aren't in common weak list", () => {
    expect(() => validatePasswordPolicy("CorrectHorseBatteryStaple99!")).not.toThrow();
    expect(() => validatePasswordPolicy("SecureP@ssw0rd!2026")).not.toThrow();
  });

  it("rejects passwords shorter than 10 characters", () => {
    expect(() => validatePasswordPolicy("Short1!")).toThrow(ValidationError);
    expect(() => validatePasswordPolicy("123456789")).toThrow(ValidationError);
  });

  it("rejects empty or missing passwords", () => {
    expect(() => validatePasswordPolicy("")).toThrow(ValidationError);
    expect(() => validatePasswordPolicy(null as unknown as string)).toThrow(ValidationError);
  });

  it("rejects common weak passwords even if length >= 10", () => {
    expect(() => validatePasswordPolicy("password123")).toThrow(ValidationError);
    expect(() => validatePasswordPolicy("1234567890")).toThrow(ValidationError);
    expect(() => validatePasswordPolicy("coworkflow123")).toThrow(ValidationError);
  });
});
