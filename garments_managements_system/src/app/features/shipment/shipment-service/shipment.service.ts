import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Shipment } from '../../../models/shipment/shipment.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private api = inject(ApiService);
  private endpoint = 'shipments';

  getShipments(): Observable<Shipment[]> {
    return this.api.getAll<Shipment>(this.endpoint);
  }

  getShipmentById(id: string): Observable<Shipment> {
    return this.api.getById<Shipment>(this.endpoint, id);
  }

  createShipment(data: Shipment): Observable<Shipment> {
    return this.api.create<Shipment>(this.endpoint, data);
  }

  updateShipment(id: string, data: Partial<Shipment>): Observable<Shipment> {
    return this.api.update<Shipment>(this.endpoint, id, data as Shipment);
  }
}
