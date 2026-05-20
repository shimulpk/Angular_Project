export interface BOMItem {
  materialName: string;
  category: string;
  unit: string;
  consumption: number;
  wastagePercent: number;
  supplier: string;
  totalRequirement: number; // Calculated: consumption * (1 + wastagePercent/100)
}


export interface BOM {
  id?: string;
  styleId: string;
  version: string;
  status: 'Draft' | 'Final';
  items: BOMItem[];
  createdAt: string;
}

