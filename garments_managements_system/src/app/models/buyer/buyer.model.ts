export interface BuyerContact {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface Buyer {
  id?: string;
  buyerCode: string;
  companyName: string;
  country: string;
  currency: string;
  paymentTerms: string;
  address?: string;
  website?: string;
  contacts: BuyerContact[];
  status: 'Active' | 'Inactive';
}
