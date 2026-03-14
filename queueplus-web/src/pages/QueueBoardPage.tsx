import { useEffect, useMemo, useState } from "react";
import { queueApi } from "../api/queue";
import { branchApi } from "../api/branch";
import { serviceApi } from "../api/service";
import type { QueueItem, QueuePagination, QueueStats } from "../types/queue";
import type { Branch } from "../types/branch";
import type { ServiceItem } from "../types/service";
import DashboardLayout from "../layouts/DashboardLayout";

const statusButtonMap = [
  { label: "Call", value: "called", className: "bg-blue-500 hover:bg-blue-600" },
  { label: "Serving", value: "serving", className: "bg-amber-500 hover:bg-amber-600" },
  { label: "Complete", value: "completed", className: "bg-emerald-500 hover:bg-emerald-600" },
  { label: "Cancel", value: "cancelled", className: "bg-red-500 hover:bg-red-600" },
];

export default function QueueBoardPage() {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const [pagination, setPagination] = useState<QueuePagination>({
    hasNext: false,
    hasPrev: false,
    limit: 5,
    page: 1,
    totalCount: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const branchMap = useMemo(() => {
    return new Map(branches.map((branch) => [branch.id, branch.name]));
  }, [branches]);

  const serviceMap = useMemo(() => {
    return new Map(services.map((service) => [service.id, service.name]));
  }, [services]);

  const fetchReferenceData = async () => {
    const [branchData, serviceData] = await Promise.all([
      branchApi.getBranches(),
      serviceApi.getServices(),
    ]);

    setBranches(branchData);
    setServices(serviceData);
  };

  const fetchQueues = async (showMainLoader = false) => {
    try {
      setError(null);

      if (showMainLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const [queueResponse, statsData] = await Promise.all([
        queueApi.getQueues({
          page,
          limit,
          branchId: selectedBranchFilter || undefined,
        }),
        queueApi.getQueueStats(),
      ]);

      setQueues(queueResponse.data);
      setPagination(
        queueResponse.pagination ?? {
          hasNext: false,
          hasPrev: false,
          limit,
          page,
          totalCount: queueResponse.data.length,
          totalPages: 1,
        }
      );
      setStats(statsData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load queue board"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchQueues(true);
  }, [page, limit, selectedBranchFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      await queueApi.updateQueueStatus(id, status);
      await fetchQueues(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update queue status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBranchFilterChange = (branchId: string) => {
    setSelectedBranchFilter(branchId);
    setPage(1);
  };

  const handleLimitChange = (value: string) => {
    setLimit(Number(value));
    setPage(1);
  };

  return (
    <DashboardLayout
      title="Queue Board"
      description="Staff and admin can monitor and update queue status here"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => fetchQueues(false)}
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

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <StatCard label="Total" value={stats.total ?? pagination.totalCount ?? queues.length} />
          <StatCard label="Waiting" value={stats.waiting ?? countStatus(queues, "waiting")} />
          <StatCard label="Called" value={stats.called ?? countStatus(queues, "called")} />
          <StatCard label="Serving" value={stats.serving ?? countStatus(queues, "serving")} />
          <StatCard label="Completed" value={stats.completed ?? countStatus(queues, "completed")} />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={selectedBranchFilter}
            onChange={(e) => handleBranchFilterChange(e.target.value)}
            className="w-[220px] rounded-lg border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
          >
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <select
            value={String(limit)}
            onChange={(e) => handleLimitChange(e.target.value)}
            className="w-[140px] rounded-lg border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
          >
            <option value="5">5 / page</option>
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
          </select>

          <button
            onClick={() => {
              setSelectedBranchFilter("");
              setPage(1);
              setLimit(5);
            }}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
          >
            Reset Filters
          </button>

          {selectedBranchFilter && (
            <p className="text-sm text-slate-500">
              Filtering by: {branchMap.get(selectedBranchFilter) || selectedBranchFilter}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-slate-900">All Queues</h2>
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages} • Total {pagination.totalCount}
            </p>
          </div>

          {isLoading ? (
            <div className="p-6 text-slate-500">Loading queues...</div>
          ) : queues.length === 0 ? (
            <div className="p-6 text-slate-500">No queues found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-sm text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Queue No.</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Branch</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3">Actions</th>
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

                      <td className="px-6 py-4">
                        <StatusBadge status={queue.status} />
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(queue.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {statusButtonMap.map((action) => (
                            <button
                              key={action.value}
                              onClick={() => handleUpdateStatus(queue.id, action.value)}
                              disabled={updatingId === queue.id}
                              className={`rounded-lg px-3 py-1 text-sm text-white disabled:opacity-60 ${action.className}`}
                            >
                              {updatingId === queue.id ? "Updating..." : action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={!pagination.hasPrev}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="text-sm text-slate-500">
            Current page: {pagination.page}
          </div>

          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!pagination.hasNext}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    waiting: "bg-slate-100 text-slate-700",
    called: "bg-blue-100 text-blue-700",
    serving: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        colorMap[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(date?: string) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}

function countStatus(queues: QueueItem[], targetStatus: string) {
  return queues.filter((queue) => queue.status === targetStatus).length;
}