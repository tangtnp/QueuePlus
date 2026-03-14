import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">QueuePlus Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome {user?.fullName || user?.email}
          </p>
          <p className="text-sm text-slate-500">Role: {user?.role}</p>

          <button
            onClick={handleLogout}
            className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/queues" className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Queue Board</h2>
            <p className="mt-2 text-slate-500">View and update queue status</p>
          </Link>

          {user?.role === "admin" && (
            <>
              <Link
                to="/branches"
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold">Branches</h2>
                <p className="mt-2 text-slate-500">Manage all branches</p>
              </Link>

              <Link
                to="/services"
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-semibold">Services</h2>
                <p className="mt-2 text-slate-500">Manage all services</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}