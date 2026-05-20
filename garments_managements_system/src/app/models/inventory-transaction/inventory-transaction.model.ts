export interface InventoryTransaction {
  id?: string;
  itemId: string;
  itemName: string;
  type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  referenceNo: string;
  date: string;
  remarks: string;
}

