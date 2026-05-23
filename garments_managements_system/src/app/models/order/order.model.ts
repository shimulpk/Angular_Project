export interface OrderItem {
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  type?: 'Short Sleeve' | 'Full Sleeve';
}


export interface Order {
  id?: string;
  poNumber: string;
  buyerId: string;
  styleId: string;
  orderDate: string;
  shipDate: string;
  status: 'DRAFT' | 'CONFIRMED' | 'IN_PRODUCTION' | 'SHIPPED' | 'CLOSED' | 'Pending' | 'Confirmed';
  items: OrderItem[];
  totalQuantity: number;
  totalAmount: number;
  
  shippingAddress?: string;
  subtotal?: number;
  vat?: number;
  grandTotal?: number;
}
