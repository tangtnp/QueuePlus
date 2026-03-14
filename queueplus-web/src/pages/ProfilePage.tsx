import DashboardLayout from "../layouts/DashboardLayout";
import { useAuthStore } from "../store/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout
      title="My Profile"
      description="Your account information"
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Profile Details
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoRow label="Name" value={user?.name || "-"} />
            <InfoRow label="Email" value={user?.email || "-"} />
            <InfoRow label="Role" value={user?.role || "-"} />
            <InfoRow label="User ID" value={user?.id || "-"} />
            <InfoRow label="Created At" value={user?.createdAt || "-"} />
            <InfoRow label="Updated At" value={user?.updatedAt || "-"} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-900 break-all">{value}</p>
    </div>
  );
}