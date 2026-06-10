export interface BomStyle {
  id?: string;
  styleCode: string;
  styleName: string;
  styleType?: 'Casual' | 'Formal';
  description?: string;
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  sizeSet: string[];
}
