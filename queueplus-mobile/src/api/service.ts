import { api } from "./client";
import type { ServiceItem } from "../types/service";

const normalizeServiceList = (payload: any): ServiceItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.services)) return payload.services;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const serviceApi = {
  async getServices(branchId?: string): Promise<ServiceItem[]> {
    const url = branchId
      ? `/services?branchId=${encodeURIComponent(branchId)}`
      : "/services";

    const response = await api.get(url);
    return normalizeServiceList(response.data);
  },
};