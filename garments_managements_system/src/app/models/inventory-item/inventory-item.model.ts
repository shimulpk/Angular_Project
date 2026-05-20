export interface InventoryItem {
  id?: string;
  item: string;
  unit: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  reorderLevel: number;
  category: string;
}

