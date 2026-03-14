import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface GuestRouteProps {
  children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Checking session...</p>
      </div>
    );
  }

  if (user) {
    if (user.role === "user") return <Navigate to="/my-queues" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}