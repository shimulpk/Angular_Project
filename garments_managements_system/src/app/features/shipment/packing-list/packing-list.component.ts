import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ShipmentService } from '../shipment-service/shipment.service';
import { OrderService } from '../../orders/order-service/order.service';
import { Shipment } from '../../../models/shipment/shipment.model';
import { Order } from '../../../models/order/order.model';
@Component({
  selector: 'app-packing-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packing-list.component.html',
  styleUrl: './packing-list.component.css'})
export class PackingListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shipService = inject(ShipmentService);
  
  shipment: Shipment | null = null;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shipService.getShipmentById(id).subscribe(data => this.shipment = data);
    }
  }

  print() {
    window.print();
  }
}
