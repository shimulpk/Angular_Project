import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private api = inject(ApiService);
  private endpoint = 'orders';

  getOrders(): Observable<any[]> {
    return this.api.getAll<any>(this.endpoint);
  }

  getOrderById(id: string): Observable<any> {
    return this.api.getById<any>(this.endpoint, id);
  }

  createOrder(order: any): Observable<any> {
    return this.api.create<any>(this.endpoint, order);
  }

  updateOrder(id: string, order: any): Observable<any> {
    return this.api.update<any>(this.endpoint, id, order);
  }

  deleteOrder(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
