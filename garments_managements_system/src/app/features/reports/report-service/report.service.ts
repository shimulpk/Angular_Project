import { Injectable, inject } from '@angular/core';
import { OrderService } from '../../orders/order-service/order.service';
import { ProductionService } from '../../production/production-service/production.service';
import { QAService } from '../../qa/qa-service/qa.service';
import { InventoryService } from '../../inventory/inventory-service/inventory.service';
import { ShipmentService } from '../../shipment/shipment-service/shipment.service';
import { forkJoin, map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private orderService = inject(OrderService);
  private prodService = inject(ProductionService);
  private qaService = inject(QAService);
  private invService = inject(InventoryService);
  private shipService = inject(ShipmentService);

  getExecutiveSummary(): Observable<any> {
    return forkJoin({
      orders: this.orderService.getOrders(),
      production: this.prodService.getProductionTracking(),
      qa: this.qaService.getInspections(),
      inventory: this.invService.getInventory(),
      shipments: this.shipService.getShipments()
    }).pipe(
      map(data => {
        const totalOrderValue = data.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const avgDHU = data.qa.reduce((sum, q) => sum + q.dhu, 0) / (data.qa.length || 1);
        const totalInventoryValue = data.inventory.reduce((sum, i) => sum + (i.qtyOnHand * 5), 0); // Mock price $5

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
