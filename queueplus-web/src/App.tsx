import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    fetchMe();
    initTheme();
  }, [fetchMe, initTheme]);

  return <AppRouter />;
}