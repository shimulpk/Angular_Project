export interface UOM {
  id?: string;
  productName: string;
  size: 'S' | 'M' | 'L' | 'XL';
  body: number;
  sleeve: number;
  pocket: number;
  wastage: number;
  shrinkage: number;
  totalBaseFabric: number; // Auto-calculated
}
