import { api } from "./client";
import type { ServiceItem, ServicePayload } from "../types/service";

const normalizeServiceList = (payload: any): ServiceItem[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.services)) return payload.services;
  if (Array.isArray(payload?.data?.services)) return payload.data.services;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeService = (payload: any): ServiceItem | null => {
  if (payload?.service) return payload.service;
  if (payload?.data?.service) return payload.data.service;
  if (payload?.data) return payload.data;
  return payload ?? null;
};

export const serviceApi = {
  async getServices(branchId?: string): Promise<ServiceItem[]> {
    const url = branchId
      ? `/services?branchId=${encodeURIComponent(branchId)}`
      : "/services";

    const response = await api.get(url);
    return normalizeServiceList(response.data);
  },

  async searchServicesByTags(tags: string[]): Promise<ServiceItem[]> {
    const query = tags.map((tag) => `tags=${encodeURIComponent(tag)}`).join("&");
    const response = await api.get(`/services/search/by-tags?${query}`);
    return normalizeServiceList(response.data);
  },

  async createService(payload: ServicePayload): Promise<ServiceItem | null> {
    const response = await api.post("/services", payload);
    return normalizeService(response.data);
  },

  async updateService(id: string, payload: ServicePayload): Promise<ServiceItem | null> {
    const response = await api.put(`/services/${id}`, payload);
    return normalizeService(response.data);
  },

  async deleteService(id: string) {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },

  async hardDeleteService(id: string) {
    const response = await api.delete(`/services/${id}/hard`);
    return response.data;
  },
};