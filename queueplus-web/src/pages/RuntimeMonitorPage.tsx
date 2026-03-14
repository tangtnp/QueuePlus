import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { monitorApi } from "../api/monitor";
import MonitorJsonCard from "../components/ui/MonitorJsonCard";

export default function RuntimeMonitorPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuntimeMonitor = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await monitorApi.getRuntimeMonitor();
      setData(response);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load runtime monitor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuntimeMonitor();
  }, []);

  return (
    <DashboardLayout
      title="Runtime Monitor"
      description="Application runtime and process-level monitoring"
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex justify-end">
          <button
            onClick={fetchRuntimeMonitor}
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
            Loading runtime monitor...
          </div>
        ) : (
          <MonitorJsonCard title="Runtime Monitor Response" data={data} />
        )}
      </div>
    </DashboardLayout>
  );
}