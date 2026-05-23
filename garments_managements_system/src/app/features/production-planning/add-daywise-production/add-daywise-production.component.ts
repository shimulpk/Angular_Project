import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-daywise-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-calendar-plus me-2"></i>Add Day-wise Production</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Date</label>
                <input type="date" class="form-control" formControlName="date">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Order ID</label>
                <select class="form-select" formControlName="orderId">
                  <option value="">Select Order</option>
                  <option *ngFor="let o of productionOrders" [value]="o.orderId">{{ o.orderId }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Size</label>
                <select class="form-select" formControlName="size">
                  <option value="">Select Size</option>
                  <option *ngFor="let s of sizes" [value]="s">{{ s }}</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Produced Quantity</label>
                <input type="number" class="form-control" formControlName="producedQty" min="0">
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Add Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddDaywiseProductionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  productionOrders: any[] = [];
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  form: FormGroup = this.fb.group({
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    orderId: ['', Validators.required],
    size: ['', Validators.required],
    producedQty: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.svc.getProductionOrders().subscribe(d => this.productionOrders = d);
  }

  onSubmit() {
    if (this.form.valid) {
      this.svc.createDaywiseProduction(this.form.value).subscribe(() => {
        this.notify.success('Day-wise entry added successfully');
        this.form.patchValue({ producedQty: 0 });
      });
    }
  }
}
