import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Production, ProductionLine } from '../../../models/production/production.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ProductionService {
  private api = inject(ApiService);

  getProductionTracking(): Observable<Production[]> {
    return this.api.getAll<Production>('productionOrders');
  }

  getProductionLines(): Observable<ProductionLine[]> {
    return this.api.getAll<ProductionLine>('productionLines');
  }

  updateProduction(id: string, data: Partial<Production>): Observable<Production> {
    return this.api.update<Production>('productionOrders', id, data as Production);
  }

  createProduction(data: Production): Observable<Production> {
    return this.api.create<Production>('productionOrders', data);
  }
}
