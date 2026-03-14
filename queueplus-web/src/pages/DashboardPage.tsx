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
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                QueuePlus Dashboard
              </h1>
              <p className="mt-2 text-slate-600">
                Welcome {user?.name || user?.email}
              </p>
              <p className="text-sm text-slate-500">Role: {user?.role}</p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/queues"
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-slate-900">Queue Board</h2>
            <p className="mt-2 text-slate-500">
              View queues and update queue status
            </p>
          </Link>

          {user?.role === "admin" && (
            <>
              <Link
                to="/branches"
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900">Branches</h2>
                <p className="mt-2 text-slate-500">
                  Create, edit, and manage branches
                </p>
              </Link>

              <Link
                to="/services"
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-slate-900">Services</h2>
                <p className="mt-2 text-slate-500">
                  Create, edit, and manage services
                </p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}