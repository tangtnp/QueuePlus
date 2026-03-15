import { create } from "zustand";
import { api } from "../api/client";
import type { AuthUser, LoginPayload } from "../types/auth";

const normalizeUser = (payload: any): AuthUser | null => {
  if (payload?.user) return payload.user;
  if (payload?.data?.user) return payload.data.user;
  if (payload?.data) return payload.data;
  return payload ?? null;
};

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
        user: normalizeUser(response.data),
        isLoading: false,
      });

      return true;
    } catch (error: any) {
      set({
        isLoading: false,
        user: null,
        error:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Login failed",
      });
      return false;
    }
  },

  fetchMe: async () => {
    try {
      set({ isCheckingAuth: true });
      const response = await api.get("/auth/me");

      set({
        user: normalizeUser(response.data),
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
      // ignore
    } finally {
      set({ user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));