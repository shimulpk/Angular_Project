export interface FinishingPlan {
  id?: string;
  sewing_plan_id: string;
  buyer_name: string;
  order_no: string;
  style_no: string;
  color: string;
  input_qty: number;
  target_qty: number;
  proc_trimming: boolean;
  proc_ironing: boolean;
  proc_washing: boolean;
  proc_button_attach: boolean;
  finishing_table_no: string;
  supervisor_name: string;
  start_date: string;
  end_date: string;
  status: string;
  finishing_plan_id: string;
  pass_qty?: number;
  rejection_qty?: number;
}
