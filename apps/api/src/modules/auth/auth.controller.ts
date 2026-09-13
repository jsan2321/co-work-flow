import { Request, Response, NextFunction } from "express";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import { UnauthorizedError } from "../../shared/errors/app-error.js";

const COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/api/v1/auth";

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: COOKIE_PATH,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const user = await authService.register(input);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.login(input);

    res.cookie(COOKIE_NAME, result.rawRefreshToken, getCookieOptions());

    res.status(200).json({
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.[COOKIE_NAME];
    if (!rawRefreshToken) {
      throw new UnauthorizedError("Refresh token cookie is missing");
    }

    const result = await authService.refresh(rawRefreshToken);

    res.cookie(COOKIE_NAME, result.newRawRefreshToken, getCookieOptions());

    res.status(200).json({
      data: {
        accessToken: result.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawRefreshToken = req.cookies?.[COOKIE_NAME];
    await authService.logout(rawRefreshToken);

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: COOKIE_PATH,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
