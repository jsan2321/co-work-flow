"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserDto, ApiResponse, AuthResponse } from "@coworkflow/types";
import { apiClient, setAccessToken, setOnAuthFailure } from "./api-client";

interface AuthContextType {
  user: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserDto>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<UserDto>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleLogoutLocal = useCallback(() => {
    setUser(null);
    setAccessTokenState(null);
    setAccessToken(null);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      // POST /auth/refresh relies on the HttpOnly cookie
      const res = await apiClient<ApiResponse<AuthResponse>>("/auth/refresh", {
        method: "POST",
        skipAuth: true,
      });

      if (res.data?.accessToken && res.data?.user) {
        setAccessToken(res.data.accessToken);
        setAccessTokenState(res.data.accessToken);
        setUser(res.data.user);
      } else {
        handleLogoutLocal();
      }
    } catch {
      handleLogoutLocal();
    } finally {
      setIsLoading(false);
    }
  }, [handleLogoutLocal]);

  useEffect(() => {
    setOnAuthFailure(() => {
      handleLogoutLocal();
    });

    // Run silent refresh on initial application load
    refreshSession();
  }, [refreshSession, handleLogoutLocal]);

  const login = async (email: string, password: string): Promise<UserDto> => {
    const res = await apiClient<ApiResponse<AuthResponse>>("/auth/login", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    });

    const { accessToken, user: loggedInUser } = res.data;
    setAccessToken(accessToken);
    setAccessTokenState(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<UserDto> => {
    await apiClient<ApiResponse<{ user: UserDto }>>("/auth/register", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(data),
    });

    // Automatically log in after registration
    return login(data.email, data.password);
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors during logout
    } finally {
      handleLogoutLocal();
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken: accessTokenState,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
