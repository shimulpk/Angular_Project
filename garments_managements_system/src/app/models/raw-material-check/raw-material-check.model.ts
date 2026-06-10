export interface RawMaterialCheckDetail {
  productName: string;
  size: string;
  type: string;
  baseFabric: number;
  qty: number;
  calculatedFabric: number;
  hasUom: boolean;
}

export interface RawMaterialCheck {
  id?: string;
  styleId: string;
  orderId?: string;
  orderDbId?: string;
  orderNumber?: string;
  date: string;
  totalFabricRequired: number;
  details: RawMaterialCheckDetail[];
}
