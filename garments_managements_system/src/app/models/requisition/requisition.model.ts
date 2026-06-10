export interface Requisition {
  id?: string;
  prDate: string;
  department: string;
  requestedBy: string;
  categoryName: string;
  orderId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'Pending' | 'Approved' | 'Rejected';
}
