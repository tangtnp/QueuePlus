export type QueueStatus =
  | "waiting"
  | "called"
  | "serving"
  | "completed"
  | "cancelled";

export interface QueueItem {
  id: string;
  queueNumber?: string;
  customerName?: string;
  status: QueueStatus | string;
  createdAt?: string;
  updatedAt?: string;
  branchId?: string;
  serviceId?: string;
}

export interface QueueStats {
  total?: number;
  waiting?: number;
  called?: number;
  serving?: number;
  completed?: number;
  cancelled?: number;
}

export interface QueuePagination {
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
  page: number;
  totalCount: number;
  totalPages: number;
}

export interface QueueFilters {
  branchId?: string;
  serviceId?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

export interface QueueListResponse {
  data: QueueItem[];
  filters?: QueueFilters;
  pagination?: QueuePagination;
}