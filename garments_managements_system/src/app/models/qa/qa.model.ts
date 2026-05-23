export interface Defect {
  type: string;
  count: number;
}


export interface QAInspection {
  id?: string;
  orderId: string;
  poNumber: string;
  lineId: string;
  inspectionType: 'Inline' | 'Final';
  checkQty: number;
  passQty: number;
  failQty: number;
  reworkQty?: number;
  rejectQty?: number;
  defects: Defect[];
  dhu: number; // (Total Defects / Check Qty) * 100
  inspector: string;
  date: string;
}

