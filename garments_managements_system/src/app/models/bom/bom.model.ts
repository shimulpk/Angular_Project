export interface BOMItem {
  id?: string;
  bomId?: string;
  materialId?: string;
  materialName: string;
  category?: string;
  unit: string;
  consumption: number;
  wastagePercent: number;
  supplier?: string;
  totalRequirement: number; // Calculated
  
  // New Merchandising fields
  serial?: number;
  baseFabric?: string;
  styleCode?: string;
  quantity?: number;
  unitPrice?: number;
  totalCost?: number;
}

export interface BOM {
  id?: string;
  poId?: string;
  styleId: string;
  version: string;
  status: 'Draft' | 'Final';
  items: BOMItem[];
  createdAt: string;
}
