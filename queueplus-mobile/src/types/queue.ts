export interface MyQueueItem {
  id: string;
  queueNumber?: string;
  customerName?: string;
  branchId?: string;
  serviceId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQueuePayload {
  customerName: string;
  userId: string;
  branchId: string;
  serviceId: string;
}

export interface PendingQueueItem extends CreateQueuePayload {
  localId: string;
  fingerprint: string;
  createdAt: string;
  syncStatus: "pending" | "failed";
  retryCount: number;
}

export interface MyQueueItem {
  id: string;
  queueNumber?: string;
  customerName?: string;
  branchId?: string;
  serviceId?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQueuePayload {
  customerName: string;
  userId: string;
  branchId: string;
  serviceId: string;
}