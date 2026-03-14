import { useAuthStore } from "../store/authStore";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardCard from "../components/ui/DashboardCard";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview for staff and admin"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard
          to="/queues"
          title="Queue Board"
          description="View queues and update queue status"
        />

        {user?.role === "admin" && (
          <>
            <DashboardCard
              to="/branches"
              title="Branches"
              description="Create, edit, and manage branches"
            />

            <DashboardCard
              to="/services"
              title="Services"
              description="Create, edit, search, and manage services"
            />
          </>
        )}
        
        <DashboardCard
          to="/health"
          title="Health Check"
          description="Check basic backend health status"
        />

        <DashboardCard
          to="/monitor/system"
          title="System Monitor"
          description="View system-level server information"
        />

        <DashboardCard
          to="/monitor/runtime"
          title="Runtime Monitor"
          description="View application runtime information"
        />
      </div>
    </DashboardLayout>
  );
}