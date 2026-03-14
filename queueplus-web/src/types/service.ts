export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
  branchId?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  branch?: {
    id: string;
    name: string;
  };
}

export interface ServicePayload {
  name: string;
  description?: string;
  tags?: string[];
  branchId?: string;
}