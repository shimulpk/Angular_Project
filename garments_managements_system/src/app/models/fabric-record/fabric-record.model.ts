export interface FabricRecordDetail {
  productName: string;
  size: string;
  type: string;
  baseFabric: number;
  qty: number;
  calculatedFabric: number;
  hasUom: boolean;
}

export interface FabricRecord {
  id?: string;
  styleId: string;
  orderId?: string;
  orderDbId?: string;
  orderNumber?: string;
  date: string;
  totalFabricRequired: number;
  details: FabricRecordDetail[];
}
