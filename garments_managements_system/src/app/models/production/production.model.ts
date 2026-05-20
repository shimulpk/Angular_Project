export interface ProductionLine {
  id: string;
  name: string;
  capacity: number;
}


export interface Production {
  id?: string;
  orderId: string;
  poNumber: string;
  lineId: string;
  stage: 'CUTTING' | 'SEWING' | 'FINISHING' | 'PACKING';
  targetQty: number;
  actualQty: number;
  startDate: string;
  status: 'In Progress' | 'Completed' | 'Delayed';
}

