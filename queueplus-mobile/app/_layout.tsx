import { Stack } from "expo-router";
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useAuthStore } from "../src/store/authStore";
import { useNetworkStore } from "../src/store/networkStore";
import { syncPendingQueues } from "../src/utils/offlineQueue";

export default function RootLayout() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { setIsOnline, setIsSyncing, setLastSyncAt } = useNetworkStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online =
        Boolean(state.isConnected) && state.isInternetReachable !== false;

      setIsOnline(online);

      if (online) {
        try {
          setIsSyncing(true);
          await syncPendingQueues();
          setLastSyncAt(new Date().toISOString());
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, [setIsOnline, setIsSyncing, setLastSyncAt]);

  return <Stack screenOptions={{ headerShown: false }} />;
}