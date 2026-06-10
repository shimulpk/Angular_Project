export interface StockTransaction {
  id?: string;
  inventoryItemId: string;
  quantity: number;
  date: string;
  type: 'IN' | 'OUT';
  itemName: string;
  timestamp?: string;
}
