import { useEffect, useState } from "react";
import { branchApi } from "../api/branch";
import type { Branch, BranchPayload } from "../types/branch";
import DashboardLayout from "../layouts/DashboardLayout";

const initialForm: BranchPayload = {
  name: "",
  location: "",
  phone: "",
};

export default function BranchPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<BranchPayload>(initialForm);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await branchApi.getBranches();
      setBranches(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load branches"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingBranchId(null);
  };

  const handleChange = (field: keyof BranchPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranchId(branch.id);
    setForm({
      name: branch.name || "",
      location: branch.location || "",
      phone: branch.phone || "",
    });
    setSuccessMessage(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Branch name is required");
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      setIsSubmitting(true);

      if (editingBranchId) {
        await branchApi.updateBranch(editingBranchId, form);
        setSuccessMessage("Branch updated successfully");
      } else {
        await branchApi.createBranch(form);
        setSuccessMessage("Branch created successfully");
      }

      resetForm();
      await fetchBranches();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to save branch"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this branch?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      await branchApi.deleteBranch(id);
      setSuccessMessage("Branch deleted successfully");
      await fetchBranches();

      if (editingBranchId === id) {
        resetForm();
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete branch"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
    title="Branch Management"
    description="Create, edit, and delete branch records"
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

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingBranchId ? "Edit Branch" : "Create Branch"}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                  placeholder="Enter branch name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone
                </label>
                <textarea
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="min-h-[110px] w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                  placeholder="Enter phone"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingBranchId
                    ? "Update Branch"
                    : "Create Branch"}
                </button>

                {editingBranchId && (
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
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900">All Branches</h2>

              <button
                onClick={fetchBranches}
                className="rounded-lg bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
              >
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="p-6 text-slate-500">Loading branches...</div>
            ) : branches.length === 0 ? (
              <div className="p-6 text-slate-500">No branches found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3">Created</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {branches.map((branch) => (
                      <tr key={branch.id} className="border-t border-slate-100">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {branch.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {branch.location || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {branch.phone || "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {formatDate(branch.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(branch)}
                              className="rounded-lg bg-amber-500 px-3 py-1 text-sm text-white hover:bg-amber-600"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(branch.id)}
                              disabled={deletingId === branch.id}
                              className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 disabled:opacity-60"
                            >
                              {deletingId === branch.id ? "Deleting..." : "Delete"}
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

function formatDate(date?: string) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString();
  } catch {
    return date;
  }
}