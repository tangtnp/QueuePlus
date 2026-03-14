import { create } from "zustand";
import { api } from "../api/client";
import type { AuthUser, LoginPayload } from "../types/auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: false,
  error: null,

  login: async (payload) => {
    try {
      set({ isLoading: true, error: null });

      await api.post("/auth/login", payload);
      const response = await api.get("/auth/me");

      set({
        user: response.data?.data ?? response.data ?? null,
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      set({
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Login failed",
        isLoading: false,
        user: null,
      });
      return false;
    }
  },

  fetchMe: async () => {
    try {
      set({ isCheckingAuth: true });

      const response = await api.get("/auth/me");

      set({
        user: response.data?.data ?? response.data ?? null,
        isCheckingAuth: false,
      });
    } catch {
      set({
        user: null,
        isCheckingAuth: false,
      });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore logout error
    } finally {
      set({ user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));