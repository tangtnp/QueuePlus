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