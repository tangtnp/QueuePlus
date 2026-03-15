import { api } from "./client";
import type { Branch } from "../types/branch";

const normalizeBranchList = (payload: any): Branch[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.branches)) return payload.branches;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const branchApi = {
  async getBranches(): Promise<Branch[]> {
    const response = await api.get("/branches");
    return normalizeBranchList(response.data);
  },
};