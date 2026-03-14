import { api } from "./client";

export interface HealthResponse {
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface SystemMonitorResponse {
  [key: string]: any;
}

export interface RuntimeMonitorResponse {
  [key: string]: any;
}

export const monitorApi = {
  async getHealth(): Promise<HealthResponse> {
    const response = await api.get("/health");
    return response.data;
  },

  async getSystemMonitor(): Promise<SystemMonitorResponse> {
    const response = await api.get("/monitor/system");
    return response.data;
  },

  async getRuntimeMonitor(): Promise<RuntimeMonitorResponse> {
    const response = await api.get("/monitor/runtime");
    return response.data;
  },
};