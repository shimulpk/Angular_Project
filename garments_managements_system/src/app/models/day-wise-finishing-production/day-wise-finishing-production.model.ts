export interface DayWiseFinishingProduction {
  id?: string;
  finishing_plan_id: string;
  plan_id: string;
  date: string;
  pass_qty: number;
  reject_qty: number;
  remarks?: string;
  style_no: string;
  buyer_name: string;
}
