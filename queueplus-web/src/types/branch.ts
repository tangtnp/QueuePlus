export interface Branch {
  id: string;
  name: string;
  location?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchPayload {
  name: string;
  location?: string;
  phone?: string;
}