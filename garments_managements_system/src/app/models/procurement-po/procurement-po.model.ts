export interface ProcurementPO {
  id?: string;
  poNumber: string;
  poDate: string;
  deliveryDate: string;
  vendorId: string;
  requisitionId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  totalPrice: number;
  vendorName?: string;
  vendorPhone?: string;
  status: string;
}
