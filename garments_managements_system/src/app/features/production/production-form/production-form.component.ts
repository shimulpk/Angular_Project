import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductionService } from '../production-service/production.service';
import { OrderService } from '../../orders/order-service/order.service';
import { Order } from '../../../models/order/order.model';
import { ProductionLine, Production } from '../../../models/production/production.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-production-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './production-form.component.html',
  styleUrl: './production-form.component.css'})
export class ProductionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private prodService = inject(ProductionService);
  private orderService = inject(OrderService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  prodForm!: FormGroup;
  confirmedOrders: Order[] = [];
  lines: ProductionLine[] = [];

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.prodForm = this.fb.group({
      orderId: ['', Validators.required],
      poNumber: [''],
      lineId: ['', Validators.required],
      stage: ['CUTTING', Validators.required],
      targetQty: [0, [Validators.required, Validators.min(1)]],
      actualQty: [0],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['In Progress']
    });
  }

  loadData() {
    this.orderService.getOrders().subscribe((orders: Order[]) => {
      this.confirmedOrders = orders.filter(o => o.status === 'CONFIRMED' || o.status === 'DRAFT'); // Simplified
    });
    this.prodService.getProductionLines().subscribe((lines: ProductionLine[]) => {
      this.lines = lines;
    });
  }

  onOrderSelect() {
    const orderId = this.prodForm.get('orderId')?.value;
    const order = this.confirmedOrders.find(o => o.id === orderId);
    if (order) {
      this.prodForm.patchValue({
        poNumber: order.poNumber,
        targetQty: order.totalQuantity
      });
    }
  }

  save() {
    if (this.prodForm.valid) {
      this.prodService.createProduction(this.prodForm.value).subscribe(() => {
        this.notify.success('Production tracking started');
        this.router.navigate(['/production']);
      });
    }
  }
}
