import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: string | null;
  setIsOnline: (value: boolean) => void;
  setIsSyncing: (value: boolean) => void;
  setLastSyncAt: (value: string | null) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  setIsOnline: (value) => set({ isOnline: value }),
  setIsSyncing: (value) => set({ isSyncing: value }),
  setLastSyncAt: (value) => set({ lastSyncAt: value }),
}));