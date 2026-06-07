import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api/api.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductionPlanningService {
  private api = inject(ApiService);

  // Production Orders
  getProductionOrders(): Observable<any[]> { return this.api.getAll<any>('productionPlanOrders'); }
  createProductionOrder(d: any): Observable<any> { return this.api.create<any>('productionPlanOrders', d); }

  // Day-wise Production
  getDaywiseProduction(): Observable<any[]> { return this.api.getAll<any>('daywiseProduction'); }
  createDaywiseProduction(d: any): Observable<any> { return this.api.create<any>('daywiseProduction', d); }
  createDayWiseCuttingProduction(d: any): Observable<any> { return this.api.create<any>('dayWiseCuttingProduction', d); }
  getDayWiseCuttingProduction(): Observable<any[]> { return this.api.getAll<any>('dayWiseCuttingProduction'); }
  updateDayWiseCuttingProduction(id: any, d: any): Observable<any> { return this.api.update<any>('dayWiseCuttingProduction', id, d); }
  deleteDayWiseCuttingProduction(id: any): Observable<any> { return this.api.delete('dayWiseCuttingProduction', id); }

  // Day-wise Sewing Production
  createDayWiseSewingProduction(d: any): Observable<any> { return this.api.create<any>('dayWiseSewingProduction', d); }
  getDayWiseSewingProduction(): Observable<any[]> { return this.api.getAll<any>('dayWiseSewingProduction'); }
  updateDayWiseSewingProduction(id: any, d: any): Observable<any> { return this.api.update<any>('dayWiseSewingProduction', id, d); }
  deleteDayWiseSewingProduction(id: any): Observable<any> { return this.api.delete('dayWiseSewingProduction', id); }

  // Day-wise Finishing Production
  createDayWiseFinishingProduction(d: any): Observable<any> { return this.api.create<any>('dayWiseFinishingProduction', d); }
  getDayWiseFinishingProduction(): Observable<any[]> { return this.api.getAll<any>('dayWiseFinishingProduction'); }
  updateDayWiseFinishingProduction(id: any, d: any): Observable<any> { return this.api.update<any>('dayWiseFinishingProduction', id, d); }
  deleteDayWiseFinishingProduction(id: any): Observable<any> { return this.api.delete('dayWiseFinishingProduction', id); }

  /** Returns all daily cutting production records for a specific cutting plan */
  getDailyProductionsByPlanId(planId: string): Observable<any[]> {
    return this.getDayWiseCuttingProduction().pipe(
      map(records => records.filter(r =>
        (r.cutting_plan_id || r.plan_id) === planId
      ))
    );
  }

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

  // Day-wise Packing Production
  createDayWisePackingProduction(d: any): Observable<any> { return this.api.create<any>('dayWisePackingProduction', d); }
  getDayWisePackingProduction(): Observable<any[]> { return this.api.getAll<any>('dayWisePackingProduction'); }
  updateDayWisePackingProduction(id: any, d: any): Observable<any> { return this.api.update<any>('dayWisePackingProduction', id, d); }
  deleteDayWisePackingProduction(id: any): Observable<any> { return this.api.delete('dayWisePackingProduction', id); }

  // FG Stock
  createFgStock(d: any): Observable<any> { return this.api.create<any>('fgStock', d); }
  getFgStock(): Observable<any[]> { return this.api.getAll<any>('fgStock'); }
}
