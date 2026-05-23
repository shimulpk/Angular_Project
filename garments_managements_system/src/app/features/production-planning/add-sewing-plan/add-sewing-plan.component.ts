import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-sewing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-layers me-2"></i>Add Sewing Plan</h5>
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
                <label class="form-label fw-semibold">Target Quantity</label>
                <input type="number" class="form-control" formControlName="targetQty" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Line Number</label>
                <select class="form-select" formControlName="lineNumber">
                  <option value="">Select Line</option>
                  <option *ngFor="let l of lines" [value]="l.lineName">{{ l.lineName }} ({{ l.lineId }})</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Daily Target</label>
                <input type="number" class="form-control" formControlName="dailyTarget" min="1" placeholder="e.g. 500">
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
                </select>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Add Sewing Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddSewingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  orders: any[] = [];
  lines: any[] = [];

  form: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    style: ['', Validators.required],
    size: ['', Validators.required],
    targetQty: [0, [Validators.required, Validators.min(1)]],
    lineNumber: ['', Validators.required],
    dailyTarget: [100, [Validators.required, Validators.min(1)]],
    startDate: [new Date().toISOString().substring(0, 10), Validators.required],
    endDate: ['', Validators.required],
    status: ['Planned', Validators.required]
  });

  ngOnInit() {
    this.svc.getProductionOrders().subscribe(data => this.orders = data);
    this.svc.getLines().subscribe(data => this.lines = data);
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const selectedOrder = this.orders.find(o => o.orderId === orderId);
    if (selectedOrder) {
      this.form.patchValue({
        style: selectedOrder.styleCode,
        size: selectedOrder.size,
        targetQty: selectedOrder.planQty,
        endDate: selectedOrder.endDate
      });
    } else {
      this.form.patchValue({
        style: '',
        size: '',
        targetQty: 0,
        endDate: ''
      });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        totalTarget: this.form.value.targetQty,
        actualOutput: 0, // Will be updated in View Sewing Plan
        lineEfficiency: 0 // Will be updated/calculated
      };
      this.svc.createSewingPlan(data).subscribe(() => {
        this.notify.success('Sewing Plan created successfully');
        this.form.reset({ startDate: new Date().toISOString().substring(0, 10), status: 'Planned', dailyTarget: 100 });
      });
    }
  }
}
