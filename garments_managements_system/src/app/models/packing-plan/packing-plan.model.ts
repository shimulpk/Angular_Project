export interface PackingPlan {
  id?: string;
  order_id?: string;
  finishing_plan_id: string;
  style_no: string;
  buyer_name: string;
  input_qty?: number;
  total_packed_qty?: number;
  rejection_qty?: number;
  packing_method: string;
  carton_qty?: number;
  pcs_per_carton: number;
  poly_bag_type?: string;
  barcode?: string;
  hang_tag?: boolean;
  shipment_date?: string;
  destination?: string;
  status: string;
  packing_plan_id: string;
  computed_total?: number;
  total_order_qty?: number;
  carton_supplier?: string;
  packing_supervisor?: string;
  start_date?: string;
  expected_shipment_date?: string;
}
