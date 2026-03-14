import { useEffect } from "react";
import AppRouter from "./router/AppRouter";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const fetchMe = useAuthStore((state) => state.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return <AppRouter />;
}