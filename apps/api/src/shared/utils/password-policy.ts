import { ValidationError } from "../errors/app-error.js";

const COMMON_WEAK_PASSWORDS = new Set([
  "password123",
  "password1234",
  "1234567890",
  "qwertyuiop",
  "letmein1234",
  "admin12345",
  "welcome1234",
  "coworkflow123",
]);

export function validatePasswordPolicy(password: string): void {
  if (!password || typeof password !== "string") {
    throw new ValidationError("Password is required");
  }

  if (password.length < 10) {
    throw new ValidationError("Password must be at least 10 characters long");
  }

  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase().trim())) {
    throw new ValidationError(
      "Password is too common or easily guessable. Please choose a stronger password."
    );
  }
}
