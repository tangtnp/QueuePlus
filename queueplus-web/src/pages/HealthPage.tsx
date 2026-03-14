import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { monitorApi } from "../api/monitor";
import MonitorJsonCard from "../components/ui/MonitorJsonCard";

export default function HealthPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await monitorApi.getHealth();
      setData(response);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load health check"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <DashboardLayout
      title="Health Check"
      description="Basic backend health status"
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex justify-end">
          <button
            onClick={fetchHealth}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">
            Loading health data...
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard
                label="Status"
                value={String(data?.status ?? "unknown")}
              />
              <InfoCard
                label="Message"
                value={String(data?.message ?? "-")}
              />
              <InfoCard
                label="HTTP"
                value="200"
              />
            </div>

            <MonitorJsonCard title="Raw Response" data={data} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}