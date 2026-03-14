import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DashboardLayout from "../layouts/DashboardLayout";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview for staff and admin"
    >
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
                Create, edit, search, and manage services
              </p>
            </Link>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}