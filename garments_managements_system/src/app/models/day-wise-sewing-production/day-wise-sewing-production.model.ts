export interface DayWiseSewingProduction {
  id?: string;
  sewing_plan_id: string;
  plan_id: string;
  date: string;
  line_no: string;
  achieved_quantity: number;
  rejection_qty: number;
  style_no: string;
  order_no: string;
}
