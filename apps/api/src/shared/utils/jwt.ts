import jwt from "jsonwebtoken";
import type { TokenPayload } from "@coworkflow/types";
import { UnauthorizedError } from "../errors/app-error.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_jwt_secret_at_least_32_characters_long_super_secure_coworkflow";
const ACCESS_TOKEN_EXPIRY = "15m";

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload & TokenPayload;

    if (!decoded.sub || !decoded.role || !decoded.email) {
      throw new UnauthorizedError("Invalid token payload structure");
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token expired", "TOKEN_EXPIRED");
    }
    throw new UnauthorizedError("Invalid access token");
  }
}
