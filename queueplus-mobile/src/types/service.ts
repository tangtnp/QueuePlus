export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  branchId?: string;
  isActive?: boolean;
}