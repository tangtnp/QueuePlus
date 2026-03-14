import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { monitorApi } from "../api/monitor";
import MonitorJsonCard from "../components/ui/MonitorJsonCard";

export default function SystemMonitorPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemMonitor = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await monitorApi.getSystemMonitor();
      setData(response);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load system monitor"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMonitor();
  }, []);

  return (
    <DashboardLayout
      title="System Monitor"
      description="Server and machine-level monitoring information"
    >
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex justify-end">
          <button
            onClick={fetchSystemMonitor}
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
            Loading system monitor...
          </div>
        ) : (
          <MonitorJsonCard title="System Monitor Response" data={data} />
        )}
      </div>
    </DashboardLayout>
  );
}