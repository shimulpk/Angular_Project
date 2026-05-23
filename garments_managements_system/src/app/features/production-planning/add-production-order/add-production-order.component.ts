import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-add-production-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-plus-circle me-2"></i>Add Production Order</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order ID</label>
                <select class="form-select" formControlName="orderId">
                  <option value="">Select Order</option>
                  <option *ngFor="let o of orders" [value]="o.id">{{ o.poNumber }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style Code</label>
                <input class="form-control" formControlName="styleCode" placeholder="e.g. TS-2024-B1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Size</label>
                <select class="form-select" formControlName="size">
                  <option value="">Select Size</option>
                  <option *ngFor="let s of sizes" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Plan Quantity</label>
                <input type="number" class="form-control" formControlName="planQty" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Start Date</label>
                <input type="date" class="form-control" formControlName="startDate">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">End Date</label>
                <input type="date" class="form-control" formControlName="endDate">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" formControlName="status">
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div class="col-md-12">
                <label class="form-label fw-semibold">Description</label>
                <textarea class="form-control" formControlName="description" rows="2" placeholder="Additional notes..."></textarea>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="button" class="btn btn-outline-secondary me-2" (click)="form.reset()">Reset</button>
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddProductionOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);
  private orderSvc = inject(OrderService);

  orders: any[] = [];
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  form: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    styleCode: ['', Validators.required],
    size: ['', Validators.required],
    planQty: [0, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: ['Planned', Validators.required],
    description: ['']
  });

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(d => this.orders = d);
  }

  onSubmit() {
    if (this.form.valid) {
      this.svc.createProductionOrder(this.form.value).subscribe(() => {
        this.notify.success('Production Order added successfully');
        this.form.reset({ status: 'Planned' });
      });
    }
  }
}
