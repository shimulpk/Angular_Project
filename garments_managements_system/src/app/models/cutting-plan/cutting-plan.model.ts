export interface CuttingPlan {
  id?: string;
  buyer_id: string;
  order_id: string;
  style_no: string;
  fabric_type: string;
  color: string;
  total_fabric_required: number;
  marker_length: number;
  marker_width: number;
  number_of_plies: number;
  marker_efficiency: number;
  planned_pieces: number;
  cutting_table_number: string;
  cutting_master: string;
  start_date: string;
  end_date: string;
  status: string;
  cutting_plan_id: string;
}
