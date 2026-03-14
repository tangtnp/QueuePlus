export type QueueStatus = "waiting" | "called" | "serving" | "completed" | "cancelled";

export interface QueueItem {
  id: string;
  queueNumber?: string;
  customerName?: string;
  status: QueueStatus | string;
  createdAt?: string;
  updatedAt?: string;

  branchId?: string;
  serviceId?: string;

  branch?: {
    id: string;
    name: string;
  };

  service?: {
    id: string;
    name: string;
  };
}

export interface QueueStats {
  total?: number;
  waiting?: number;
  called?: number;
  serving?: number;
  completed?: number;
  cancelled?: number;
}