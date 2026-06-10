export interface ProductionOrder {
  id?: string;
  orderId: string;
  styleCode: string;
  planQty: number;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  description?: string;
  short_S?: number;
  short_M?: number;
  short_L?: number;
  short_XL?: number;
  full_S?: number;
  full_M?: number;
  full_L?: number;
  full_XL?: number;
  size?: string;
}
