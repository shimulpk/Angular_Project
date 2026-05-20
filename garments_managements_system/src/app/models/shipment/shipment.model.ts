export interface Shipment {
  id?: string;
  orderId: string;
  poNumber: string;
  vesselName: string;
  billOfLading: string;
  containerNo: string;
  shipDate: string;
  destination: string;
  status: 'PENDING' | 'BOOKED' | 'SHIPPED' | 'ARRIVED' | 'DELIVERED';
  totalCartons: number;
  grossWeight: number;
}

