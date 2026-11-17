"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { authApi } from "@/services/adminApi";

export type AuthUser = {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role: string;
};

type LoginResponse = {
  success: boolean;
  message?: string;
};

const getLoginErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Login failed. Please try again.';
  }

  if (!error.response) {
    return 'Unable to reach the admin server. Check that the backend is running and try again.';
  }

  const status = error.response.status;
  const responseData = error.response.data as {
    error?: { message?: string };
    message?: string;
  } | undefined;
  const serverMessage = responseData?.error?.message || responseData?.message;

  if (status === 401) return serverMessage || 'Invalid identifier or password.';
  if (status === 423) return serverMessage || 'This admin account is temporarily locked. Try again later.';
  if (status === 429) return serverMessage || 'Too many login attempts. Please wait and try again.';
  if (status >= 500) return 'The admin server encountered an error. Please try again later.';
  if (status === 400) return serverMessage || 'Check the login details and try again.';
  return serverMessage || 'Login could not be completed. Please try again.';
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('panditji-admin-token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const me = await authApi.getMe();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const { user: admin } = await authApi.login(email, password);
      setUser(admin);

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        message: getLoginErrorMessage(err),
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
}

export default useAuth;