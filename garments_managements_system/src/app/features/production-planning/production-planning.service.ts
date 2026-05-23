import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductionPlanningService {
  private api = inject(ApiService);

  // Production Orders
  getProductionOrders(): Observable<any[]> { return this.api.getAll<any>('productionPlanOrders'); }
  createProductionOrder(d: any): Observable<any> { return this.api.create<any>('productionPlanOrders', d); }

  // Day-wise Production
  getDaywiseProduction(): Observable<any[]> { return this.api.getAll<any>('daywiseProduction'); }
  createDaywiseProduction(d: any): Observable<any> { return this.api.create<any>('daywiseProduction', d); }

  // Lines
  getLines(): Observable<any[]> { return this.api.getAll<any>('productionPlanLines'); }
  createLine(d: any): Observable<any> { return this.api.create<any>('productionPlanLines', d); }

  // Machines
  getMachines(): Observable<any[]> { return this.api.getAll<any>('machines'); }
  createMachine(d: any): Observable<any> { return this.api.create<any>('machines', d); }

  // Cutting Plans
  getCuttingPlans(): Observable<any[]> { return this.api.getAll<any>('cuttingPlans'); }
  createCuttingPlan(d: any): Observable<any> { return this.api.create<any>('cuttingPlans', d); }
  updateCuttingPlan(id: any, d: any): Observable<any> { return this.api.update<any>('cuttingPlans', id, d); }

  // Sewing Plans
  getSewingPlans(): Observable<any[]> { return this.api.getAll<any>('sewingPlans'); }
  createSewingPlan(d: any): Observable<any> { return this.api.create<any>('sewingPlans', d); }
  updateSewingPlan(id: any, d: any): Observable<any> { return this.api.update<any>('sewingPlans', id, d); }

  // Finishing Plans
  getFinishingPlans(): Observable<any[]> { return this.api.getAll<any>('finishingPlans'); }
  createFinishingPlan(d: any): Observable<any> { return this.api.create<any>('finishingPlans', d); }
  updateFinishingPlan(id: any, d: any): Observable<any> { return this.api.update<any>('finishingPlans', id, d); }

  // Packing Plans
  getPackingPlans(): Observable<any[]> { return this.api.getAll<any>('packingPlans'); }
  createPackingPlan(d: any): Observable<any> { return this.api.create<any>('packingPlans', d); }
  updatePackingPlan(id: any, d: any): Observable<any> { return this.api.update<any>('packingPlans', id, d); }
}
