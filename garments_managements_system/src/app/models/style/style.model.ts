export interface Style {
  id?: string;
  styleCode: string;
  styleName: string;
  buyerId: string;
  season: string;
  garmentType: string;
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  sizeSet: string[];
  imageUrl?: string;
  techPackUrl?: string;
}

