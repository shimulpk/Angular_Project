import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-finishing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-bookmark-star me-2"></i>Add Finishing Plan</h5>
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
                <label class="form-label fw-semibold">Finishing Quantity (Target Qty)</label>
                <input type="number" class="form-control" formControlName="finishingQty" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Section</label>
                <select class="form-select" formControlName="section">
                  <option value="">Select Section</option>
                  <option value="Ironing">Ironing</option>
                  <option value="Folding">Folding</option>
                  <option value="Tagging">Tagging</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Date</label>
                <input type="date" class="form-control" formControlName="date">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" formControlName="status">
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Add Finishing Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddFinishingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  orders: any[] = [];

  form: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    style: ['', Validators.required],
    size: ['', Validators.required],
    finishingQty: [0, [Validators.required, Validators.min(1)]],
    section: ['', Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
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
        finishingQty: selectedOrder.planQty
      });
    } else {
      this.form.patchValue({
        style: '',
        size: '',
        finishingQty: 0
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        targetQty: this.form.value.finishingQty,
        actualFinishedQty: 0,
        defectQty: 0,
        alterQty: 0,
        passQty: 0
      };
      this.svc.createFinishingPlan(data).subscribe(() => {
        this.notify.success('Finishing Plan created successfully');
        this.form.reset({ date: new Date().toISOString().substring(0, 10), status: 'Planned' });
      });
    }
  }
}
