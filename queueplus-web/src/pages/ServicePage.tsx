import { useEffect, useMemo, useState } from "react";
import { serviceApi } from "../api/service";
import { branchApi } from "../api/branch";
import type { ServiceItem, ServicePayload } from "../types/service";
import type { Branch } from "../types/branch";
import DashboardLayout from "../layouts/DashboardLayout";

const initialForm: ServicePayload = {
  name: "",
  description: "",
  tags: [],
  branchId: "",
};

export default function ServicePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<ServicePayload>(initialForm);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hardDeletingId, setHardDeletingId] = useState<string | null>(null);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInitialData = async (branchId?: string) => {
    try {
      setError(null);
      setIsLoading(true);
  
      const [serviceData, branchData] = await Promise.all([
        serviceApi.getServices(branchId),
        branchApi.getBranches(),
      ]);
  
      setServices(serviceData);
      setBranches(branchData);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load services"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData(selectedBranchFilter || undefined);
  }, [selectedBranchFilter]);
  
  const resetForm = () => {
    setForm(initialForm);
    setEditingServiceId(null);
    setTagInput("");
  };

  const handleChange = (field: keyof ServicePayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    const cleaned = tagInput.trim();
    if (!cleaned) return;

    if (form.tags?.includes(cleaned)) {
      setTagInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), cleaned],
    }));
    setTagInput("");
  };

  const handleBranchFilterChange = (branchId: string) => {
    setSelectedBranchFilter(branchId);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleEdit = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setForm({
      name: service.name || "",
      description: service.description || "",
      tags: service.tags || [],
      branchId: service.branchId || service.branch?.id || "",
    });
    setTagInput("");
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Service name is required");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      const payload: ServicePayload = {
        ...form,
        branchId: form.branchId || undefined,
      };

      if (editingServiceId) {
        await serviceApi.updateService(editingServiceId, payload);
        setSuccessMessage("Service updated successfully");
      } else {
        await serviceApi.createService(payload);
        setSuccessMessage("Service created successfully");
      }

      resetForm();
      await fetchInitialData();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to save service"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSoftDelete = async (id: string) => {
    const confirmed = window.confirm("Soft delete this service?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      await serviceApi.deleteService(id);
      setSuccessMessage("Service soft deleted successfully");
      await fetchInitialData();

      if (editingServiceId === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete service"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleHardDelete = async (id: string) => {
    const confirmed = window.confirm("Hard delete this service permanently?");
    if (!confirmed) return;

    try {
      setHardDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      await serviceApi.hardDeleteService(id);
      setSuccessMessage("Service hard deleted successfully");
      await fetchInitialData();

      if (editingServiceId === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to hard delete service"
      );
    } finally {
      setHardDeletingId(null);
    }
  };

  const handleSearchByTags = async () => {
    const tags = searchInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  
    if (tags.length === 0) {
      fetchInitialData(selectedBranchFilter || undefined);
      return;
    }
  
    try {
      setError(null);
      setIsLoading(true);
      const result = await serviceApi.searchServicesByTags(tags);
  
      const filtered = selectedBranchFilter
        ? result.filter(
            (service) =>
              service.branchId === selectedBranchFilter ||
              service.branch?.id === selectedBranchFilter
          )
        : result;
  
      setServices(filtered);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to search services by tags"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const branchOptions = useMemo(() => branches || [], [branches]);

  return (
    <DashboardLayout
    title="Service Management"
    description="Create, edit, search, and delete services"
  >
      <div className="mx-auto max-w-7xl">

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-700 shadow-sm">
            {successMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[430px_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingServiceId ? "Edit Service" : "Create Service"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Service Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[110px] w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                  placeholder="Enter service description"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Branch
                </label>
                <select
                  value={form.branchId || ""}
                  onChange={(e) => handleChange("branchId", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                    placeholder="Add tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
                  >
                    Add
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(form.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingServiceId
                    ? "Update Service"
                    : "Create Service"}
                </button>

                {editingServiceId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
        </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-slate-900">
                  All Services
                </h2>

                <div className="flex flex-wrap gap-2">
  <select
    value={selectedBranchFilter}
    onChange={(e) => handleBranchFilterChange(e.target.value)}
    className="w-[220px] rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
  >
    <option value="">All branches</option>
    {branchOptions.map((branch) => (
      <option key={branch.id} value={branch.id}>
        {branch.name}
      </option>
    ))}
  </select>

  <input
    type="text"
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    placeholder="Search by tags, comma separated"
    className="w-[280px] rounded-lg border border-slate-300 p-2 outline-none focus:border-blue-500"
  />

  <button
    onClick={handleSearchByTags}
    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
  >
    Search
  </button>

  <button
    onClick={() => {
      setSearchInput("");
      setSelectedBranchFilter("");
      fetchInitialData();
    }}
    className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
  >
    Reset
  </button>

  <button
    onClick={() => fetchInitialData(selectedBranchFilter || undefined)}
    className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-800"
  >
    Refresh
  </button>
</div>
              </div>
            </div>

            {isLoading ? (
              <div className="p-6 text-slate-500">Loading services...</div>
            ) : services.length === 0 ? (
              <div className="p-6 text-slate-500">No services found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Branch</th>
                      <th className="px-6 py-3">Tags</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {services.map((service) => (
                      <tr key={service.id} className="border-t border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {service.name}
                        </td>

                        <td className="max-w-[280px] px-6 py-4 text-slate-700">
                          <div className="line-clamp-2">
                            {service.description || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-700">
                          {service.branch?.name || findBranchName(branches, service.branchId) || "-"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(service.tags || []).length > 0 ? (
                              service.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              service.deletedAt || service.isActive === false
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {service.deletedAt || service.isActive === false ? "Inactive" : "Active"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEdit(service)}
                              className="rounded-lg bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleSoftDelete(service.id)}
                              disabled={deletingId === service.id}
                              className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:opacity-60"
                            >
                              {deletingId === service.id ? "Deleting..." : "Soft Delete"}
                            </button>

                            <button
                              onClick={() => handleHardDelete(service.id)}
                              disabled={hardDeletingId === service.id}
                              className="rounded-lg bg-black px-3 py-1 text-sm text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                              {hardDeletingId === service.id ? "Deleting..." : "Hard Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function findBranchName(branches: Branch[], branchId?: string) {
  if (!branchId) return "";
  return branches.find((branch) => branch.id === branchId)?.name || "";
}