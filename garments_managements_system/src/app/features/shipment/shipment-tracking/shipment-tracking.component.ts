import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShipmentService } from '../shipment-service/shipment.service';
import { Shipment } from '../../../models/shipment/shipment.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-shipment-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shipment-tracking.component.html',
  styleUrl: './shipment-tracking.component.css'})
export class ShipmentTrackingComponent implements OnInit {
  private shipService = inject(ShipmentService);

  shipments: Shipment[] = [];

  ngOnInit() {
    this.shipService.getShipments().subscribe((data: Shipment[]) => this.shipments = data);
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'BOOKED': return 'bg-info bg-opacity-10 text-info';
      case 'SHIPPED': return 'bg-primary bg-opacity-10 text-primary';
      case 'DELIVERED': return 'bg-success bg-opacity-10 text-success';
      default: return 'bg-secondary bg-opacity-10 text-secondary';
    }
  }
}
