export interface OrderItem {
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
}


export interface Order {
  id?: string;
  poNumber: string;
  buyerId: string;
  styleId: string;
  orderDate: string;
  shipDate: string;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'CLOSED';
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
}

