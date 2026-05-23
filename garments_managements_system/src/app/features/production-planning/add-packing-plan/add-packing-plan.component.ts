import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-packing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-box-seam me-2"></i>Add Packing / Shipping Plan</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order ID</label>
                <select class="form-select" formControlName="orderId" (change)="onOrderChange($event)">
                  <option value="">Select Order</option>
                  <option *ngFor="let o of orders" [value]="o.orderId">{{ o.orderId }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style</label>
                <input class="form-control" formControlName="style" placeholder="Select Order first" readonly>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Size</label>
                <input class="form-control" formControlName="size" placeholder="Select Order first" readonly>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Carton Quantity</label>
                <input type="number" class="form-control" formControlName="cartonQty" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Gross Weight (kg)</label>
                <input type="number" class="form-control" formControlName="grossWeight" min="0.1" step="0.1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Destination</label>
                <input class="form-control" formControlName="destination" placeholder="e.g. New York Port, USA">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Shipment Date</label>
                <input type="date" class="form-control" formControlName="shipmentDate">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status / Shipment Status</label>
                <select class="form-select" formControlName="status">
                  <option value="Planned">Planned</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                </select>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Add Packing Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddPackingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  orders: any[] = [];

  form: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    style: ['', Validators.required],
    size: ['', Validators.required],
    cartonQty: [0, [Validators.required, Validators.min(1)]],
    grossWeight: [0, [Validators.required, Validators.min(0.1)]],
    destination: ['', Validators.required],
    shipmentDate: ['', Validators.required],
    status: ['Planned', Validators.required]
  });

  ngOnInit() {
    this.svc.getProductionOrders().subscribe(data => this.orders = data);
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const selectedOrder = this.orders.find(o => o.orderId === orderId);
    if (selectedOrder) {
      this.form.patchValue({
        style: selectedOrder.styleCode,
        size: selectedOrder.size,
        shipmentDate: selectedOrder.endDate
      });
    } else {
      this.form.patchValue({
        style: '',
        size: '',
        shipmentDate: ''
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const selectedOrder = this.orders.find(o => o.orderId === this.form.value.orderId);
      const totalOrderQty = selectedOrder ? selectedOrder.planQty : 0;
      const data = {
        ...this.form.value,
        totalOrderQty: totalOrderQty,
        totalPackedQty: 0, // Will be updated in View Packing Plan
        remainingQty: totalOrderQty // calculated
      };
      this.svc.createPackingPlan(data).subscribe(() => {
        this.notify.success('Packing Plan created successfully');
        this.form.reset({ status: 'Planned' });
      });
    }
  }
}
