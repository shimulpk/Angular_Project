export interface SewingTarget {
  line_no: string;
  target_quantity: number;
}

export interface SewingPlan {
  id?: string;
  cutting_plan_id: string;
  buyer_name: string;
  order_no: string;
  style_no: string;
  color: string;
  input_received_qty: number;
  start_date: string;
  end_date: string;
  targets: SewingTarget[];
  status: string;
  sewing_plan_id: string;
  output_qty?: number;
  rejection_qty?: number;
}
