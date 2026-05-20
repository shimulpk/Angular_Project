import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Order } from '../../../models/order/order.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);
  private endpoint = 'purchaseOrders';

  getOrders(params?: any): Observable<Order[]> {
    return this.api.getAll<Order>(this.endpoint, params);
  }

  getOrderById(id: string): Observable<Order> {
    return this.api.getById<Order>(this.endpoint, id);
  }

  createOrder(order: Order): Observable<Order> {
    return this.api.create<Order>(this.endpoint, order);
  }

  updateOrder(id: string, order: Order): Observable<Order> {
    return this.api.update<Order>(this.endpoint, id, order);
  }

  deleteOrder(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
