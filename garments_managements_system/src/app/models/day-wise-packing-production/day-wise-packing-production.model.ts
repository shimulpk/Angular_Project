export interface DayWisePackingProduction {
  id?: string;
  packing_plan_id: string;
  plan_id: string;
  date: string;
  today_packed_qty: number;
  today_packed_cartons: number;
  today_reject_qty: number;
  style_no: string;
  buyer_name: string;
  order_no: string;
}
