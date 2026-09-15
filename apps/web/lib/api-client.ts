import type { ApiErrorResponse } from "@coworkflow/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

// In-memory token store (Never written to localStorage/sessionStorage)
let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let onAuthFailureCallback: (() => void) | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export function setOnAuthFailure(callback: () => void): void {
  onAuthFailureCallback = callback;
}

export class ApiError extends Error {
  code: string;
  status: number;
  requestId: string;
  details?: Array<{ field?: string; issue: string }>;

  constructor(status: number, errorData: ApiErrorResponse["error"]) {
    super(errorData.message);
    this.name = "ApiError";
    this.status = status;
    this.code = errorData.code;
    this.requestId = errorData.requestId;
    this.details = errorData.details;
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": generateUUID(),
        },
        credentials: "include", // Sends the HttpOnly refresh_token cookie
      });

      if (!response.ok) {
        setAccessToken(null);
        if (onAuthFailureCallback) {
          onAuthFailureCallback();
        }
        return null;
      }

      const json = await response.json();
      const newToken = json.data?.accessToken;
      setAccessToken(newToken || null);
      return newToken || null;
    } catch {
      setAccessToken(null);
      if (onAuthFailureCallback) {
        onAuthFailureCallback();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth = false, headers = {}, ...restOptions } = options;

  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const requestId = generateUUID();
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && !(restOptions.body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }
  requestHeaders.set("X-Request-Id", requestId);

  if (!skipAuth && inMemoryAccessToken) {
    requestHeaders.set("Authorization", `Bearer ${inMemoryAccessToken}`);
  }

  let response = await fetch(url, {
    ...restOptions,
    headers: requestHeaders,
    credentials: "include", // Ensure cookies are sent
  });

  // Handle 401 Unauthorized with silent refresh
  if (response.status === 401 && !skipAuth && !endpoint.includes("/auth/")) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      requestHeaders.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    let errorData: ApiErrorResponse["error"];
    try {
      const errorJson = (await response.json()) as ApiErrorResponse;
      errorData = errorJson.error || {
        code: "UNKNOWN_ERROR",
        message: response.statusText || "An unexpected error occurred",
        requestId,
      };
    } catch {
      errorData = {
        code: "SERVER_ERROR",
        message: `HTTP Error ${response.status}`,
        requestId,
      };
    }
    throw new ApiError(response.status, errorData);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
