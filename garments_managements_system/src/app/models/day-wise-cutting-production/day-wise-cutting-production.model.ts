export interface DayWiseCuttingProduction {
  id?: string;
  cutting_plan_id: string;
  plan_id: string;
  date: string;
  actual_cut_pieces: number;
  reject_pieces: number;
  style_no: string;
  order_id: string;
  cutting_master: string;
}
