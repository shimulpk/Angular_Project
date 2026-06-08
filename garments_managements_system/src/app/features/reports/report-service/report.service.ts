import { Injectable, inject } from '@angular/core';
import { OrderService } from '../../../core/services/order.service';
import { ProductionPlanningService } from '../../production-planning/production-planning.service';
import { ProcurementService } from '../../../core/services/procurement.service';
import { ShipmentService } from '../../shipment/shipment-service/shipment.service';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private orderService = inject(OrderService);
  private prodPlanService = inject(ProductionPlanningService);
  private procurementService = inject(ProcurementService);
  private shipService = inject(ShipmentService);

  getExecutiveSummary(): Observable<any> {
    return forkJoin({
      orders: this.orderService.getOrders(),
      production: this.prodPlanService.getProductionOrders(),
      inventory: this.procurementService.getInventory(),
      shipments: this.shipService.getShipments()
    }).pipe(
      map(data => {
        const totalOrderValue = data.orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
        const avgDHU = 0; // QA module removed
        const totalInventoryValue = data.inventory.reduce((sum: number, i: any) => sum + ((i.quantity || 0) * 5), 0); // Mock price $5

        return {
          totalOrderValue,
          avgDHU,
          totalInventoryValue,
          orderCount: data.orders.length,
          shipmentCount: data.shipments.length
        };
      })
    );
  }
}
