import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {
  private api = inject(ApiService);
  private endpoint = 'buyers';

  getBuyers(): Observable<any[]> {
    return this.api.getAll<any>(this.endpoint);
  }

  getBuyerById(id: string): Observable<any> {
    return this.api.getById<any>(this.endpoint, id);
  }

  createBuyer(buyer: any): Observable<any> {
    return this.api.create<any>(this.endpoint, buyer);
  }

  updateBuyer(id: string, buyer: any): Observable<any> {
    return this.api.update<any>(this.endpoint, id, buyer);
  }

  deleteBuyer(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
