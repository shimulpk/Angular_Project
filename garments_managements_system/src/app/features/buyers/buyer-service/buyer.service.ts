import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Buyer } from '../../../models/buyer/buyer.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private api = inject(ApiService);
  private endpoint = 'buyers';

  getBuyers(params?: any): Observable<Buyer[]> {
    return this.api.getAll<Buyer>(this.endpoint, params);
  }

  getBuyerById(id: string): Observable<Buyer> {
    return this.api.getById<Buyer>(this.endpoint, id);
  }

  createBuyer(buyer: Buyer): Observable<Buyer> {
    return this.api.create<Buyer>(this.endpoint, buyer);
  }

  updateBuyer(id: string, buyer: Buyer): Observable<Buyer> {
    return this.api.update<Buyer>(this.endpoint, id, buyer);
  }

  deleteBuyer(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
