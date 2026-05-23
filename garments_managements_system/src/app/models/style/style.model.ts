export interface StyleMeasurement {
  materialId: string;
  materialName?: string;
  quantityPerUnit: number;
  unit: string;
}

export interface Style {
  id?: string;
  styleCode: string;
  styleName: string;
  styleType?: 'Casual' | 'Formal';
  description?: string;
  buyerId: string;
  season: string;
  garmentType: string;
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  approvalStatus: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  sizeSet: string[];
  imageUrl?: string;
  techPackUrl?: string;
  measurements?: StyleMeasurement[];
}
