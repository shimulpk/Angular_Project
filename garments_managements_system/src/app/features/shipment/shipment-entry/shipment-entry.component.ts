import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ShipmentService } from '../shipment-service/shipment.service';
import { OrderService } from '../../orders/order-service/order.service';
import { Order } from '../../../models/order/order.model';
import { Shipment } from '../../../models/shipment/shipment.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-shipment-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './shipment-entry.component.html',
  styleUrl: './shipment-entry.component.css'})
export class ShipmentEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private shipmentService = inject(ShipmentService);
  private orderService = inject(OrderService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  shipmentForm!: FormGroup;
  readyOrders: Order[] = [];

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.shipmentForm = this.fb.group({
      orderId: ['', Validators.required],
      poNumber: [''],
      vesselName: ['', Validators.required],
      billOfLading: ['', Validators.required],
      containerNo: ['', Validators.required],
      shipDate: [new Date().toISOString().split('T')[0], Validators.required],
      destination: ['', Validators.required],
      status: ['BOOKED', Validators.required],
      totalCartons: [0, Validators.required],
      grossWeight: [0, Validators.required]
    });
  }

  loadData() {
    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.readyOrders = orders; // In real ERP, filter by production status
    });
  }

  onOrderSelect() {
    const id = this.shipmentForm.get('orderId')?.value;
    const order = this.readyOrders.find(o => o.id === id);
    if (order) this.shipmentForm.patchValue({ poNumber: order.poNumber });
  }

  save() {
    if (this.shipmentForm.valid) {
      this.shipmentService.createShipment(this.shipmentForm.value).subscribe(() => {
        this.notify.success('Shipment record created');
        this.router.navigate(['/shipment']);
      });
    }
  }
}
