import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { api } from "../api/client";
import { branchApi } from "../api/branch";
import { serviceApi } from "../api/service";
import type { Branch } from "../types/branch";
import type { ServiceItem } from "../types/service";

interface MyQueueItem {
  id: string;
  queueNumber?: string;
  customerName?: string;
  branchId?: string;
  serviceId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function MyQueuesPage() {
  const [queues, setQueues] = useState<MyQueueItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branchMap = useMemo(() => {
    return new Map(branches.map((branch) => [branch.id, branch.name]));
  }, [branches]);

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  const fetchMyQueues = async (showMainLoader = false) => {
    try {
      setError(null);

      if (showMainLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [queueResponse, branchData, serviceData] = await Promise.all([
        api.get("/my/queues"),
        branchApi.getBranches(),
        serviceApi.getServices(),
      ]);

      const list = Array.isArray(queueResponse.data?.data)
        ? queueResponse.data.data
        : Array.isArray(queueResponse.data)
        ? queueResponse.data
        : [];

      setQueues(list);
      setBranches(branchData);
      setServices(serviceData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load your queues"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMyQueues(true);
  }, []);

  return (
    <DashboardLayout
      title="My Queues"
      description="View only your own queue history and current queue"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => fetchMyQueues(false)}
            disabled={isRefreshing}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">My Queue List</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-slate-500">Loading your queues...</div>
          ) : queues.length === 0 ? (
            <div className="p-6 text-slate-500">No queues found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Queue No.</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Branch Name</th>
                    <th className="px-6 py-3">Service Name</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                  </tr>
                </thead>

                <tbody>
                  {queues.map((queue) => (
                    <tr key={queue.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {queue.queueNumber || queue.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {queue.customerName || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {branchMap.get(queue.branchId || "") || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {serviceMap.get(queue.serviceId || "") || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {queue.status || "-"}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {queue.createdAt
                          ? new Date(queue.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}