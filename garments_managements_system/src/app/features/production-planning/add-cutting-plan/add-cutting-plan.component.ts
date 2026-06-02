import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-cutting-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <!-- Header -->
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-scissors me-2"></i>Add Cutting Plan</h5>
          <small class="text-white-50">Define all cutting parameters for an order</small>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Order Reference -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2 mt-1">
              <i class="bi bi-link-45deg me-1"></i>Order Reference
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Order ID <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="order_id" (change)="onOrderChange($event)"
                  [class.is-invalid]="isInvalid('order_id')">
                  <option value="">— Select Order —</option>
                  <option *ngFor="let o of orders" [value]="o.id ?? o.orderId">
                    {{ o.id ?? o.orderId }} {{ o.buyerName ? '· ' + o.buyerName : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Order is required.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control" formControlName="style_no" readonly placeholder="Auto-filled from Order">
              </div>
            </div>

            <!-- Section 2: Plan Details -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2">
              <i class="bi bi-card-checklist me-1"></i>Plan Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Planned Pieces <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="planned_pieces" min="1"
                  [class.is-invalid]="isInvalid('planned_pieces')">
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Actual Pieces</label>
                <input type="number" class="form-control" formControlName="actual_pieces" min="0">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Marker Efficiency (%)</label>
                <input type="number" class="form-control" formControlName="marker_efficiency" min="0" max="100" step="0.1"
                  placeholder="Auto-calculated" readonly>
              </div>
            </div>

            <!-- Section 3: Assignment & Schedule -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2">
              <i class="bi bi-person-check me-1"></i>Assignment & Schedule
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Cutting Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="cutting_date"
                  [class.is-invalid]="isInvalid('cutting_date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Assigned To</label>
                <input class="form-control" formControlName="assigned_to" placeholder="e.g. Rakib Hassan">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="status" [class.is-invalid]="isInvalid('status')">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <!-- Section 4: Remarks -->
            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="form-label fw-semibold">Remarks / Notes</label>
                <textarea class="form-control" formControlName="remarks" rows="2"
                  placeholder="Any additional notes or special instructions..."></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  {{ submitting ? 'Saving...' : 'Save Cutting Plan' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { border-left: 3px solid #2563eb; padding-left: 8px; margin-bottom: 10px; }
  `]
})
export class AddCuttingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);
  private notify = inject(NotificationService);

  orders: any[] = [];
  styles: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    order_id:           ['', Validators.required],
    style_no:           [''],
    planned_pieces:     [null, [Validators.required, Validators.min(1)]],
    actual_pieces:      [null, Validators.min(0)],
    marker_efficiency:  [null, [Validators.min(0), Validators.max(100)]],
    cutting_date:       [new Date().toISOString().substring(0, 10), Validators.required],
    assigned_to:        [''],
    status:             ['Pending', Validators.required],
    remarks:            ['']
  });

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(data => this.orders = data);
    this.styleSvc.getStyles().subscribe(data => this.styles = data);

    this.form.valueChanges.subscribe(val => {
      const planned = val.planned_pieces;
      const actual = val.actual_pieces;
      
      if (planned && planned > 0 && actual !== null && actual !== undefined) {
        let efficiency = (actual / planned) * 100;
        efficiency = Math.round(efficiency * 10) / 10; // Round to 1 decimal place
        
        if (val.marker_efficiency !== efficiency) {
          this.form.patchValue({ marker_efficiency: efficiency }, { emitEvent: false });
        }
      } else if (val.marker_efficiency !== null) {
        this.form.patchValue({ marker_efficiency: null }, { emitEvent: false });
      }
    });
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const sel = this.orders.find(o => (o.id ?? o.orderId) === orderId);
    if (sel) {
      let styleCode = sel.styleNo ?? sel.styleCode ?? '';
      
      // If the order has a styleId but not styleNo directly, find it from the styles array
      if (!styleCode && sel.styleId) {
        const foundStyle = this.styles.find(s => s.id === sel.styleId);
        if (foundStyle) {
          styleCode = foundStyle.styleCode;
        }
      }

      this.form.patchValue({
        style_no:       styleCode,
        planned_pieces: sel.totalQuantity ?? sel.planQty ?? sel.quantity ?? null
      });
    } else {
      this.form.patchValue({ style_no: '', planned_pieces: null });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      cutting_date: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = {
      ...this.form.value,
      cutting_plan_id: 'CP-' + Date.now()
    };
    this.svc.createCuttingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Cutting Plan created successfully');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
