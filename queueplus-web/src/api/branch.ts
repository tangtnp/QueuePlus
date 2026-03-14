import { api } from "./client";
import type { Branch, BranchPayload } from "../types/branch";

const normalizeBranchList = (payload: any): Branch[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.branches)) return payload.branches;
  if (Array.isArray(payload?.data?.branches)) return payload.data.branches;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeBranch = (payload: any): Branch | null => {
  if (payload?.branch) return payload.branch;
  if (payload?.data?.branch) return payload.data.branch;
  if (payload?.data) return payload.data;
  return payload ?? null;
};

export const branchApi = {
  async getBranches(): Promise<Branch[]> {
    const response = await api.get("/branches");
    return normalizeBranchList(response.data);
  },

  async createBranch(payload: BranchPayload): Promise<Branch | null> {
    const response = await api.post("/branches", payload);
    return normalizeBranch(response.data);
  },

  async updateBranch(id: string, payload: BranchPayload): Promise<Branch | null> {
    const response = await api.put(`/branches/${id}`, payload);
    return normalizeBranch(response.data);
  },

  async deleteBranch(id: string) {
    const response = await api.delete(`/branches/${id}`);
    return response.data;
  },
};