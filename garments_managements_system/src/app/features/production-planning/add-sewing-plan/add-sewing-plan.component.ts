import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-sewing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <!-- Header -->
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-layers me-2"></i>Add Sewing Plan</h5>
          <small class="text-white-50">Link cutting plan → define sewing line targets and capacity</small>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: FK References -->
            <div class="section-title mb-2">
              <i class="bi bi-link-45deg me-1"></i>Order & Cutting Plan Reference
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order ID <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="order_id" (change)="onOrderChange($event)"
                  [class.is-invalid]="isInvalid('order_id')">
                  <option value="">— Select Order —</option>
                  <option *ngFor="let o of orders" [value]="o.id ?? o.orderId">
                    {{ o.id ?? o.orderId }}{{ o.buyerName ? ' · ' + o.buyerName : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Order is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Cutting Plan ID (FK) <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="cutting_plan_id"
                  (change)="onCuttingPlanChange($event)"
                  [class.is-invalid]="isInvalid('cutting_plan_id')">
                  <option value="">— Select Cutting Plan —</option>
                  <option *ngFor="let cp of cuttingPlans" [value]="cp.cutting_plan_id ?? cp.id">
                    {{ cp.cutting_plan_id ?? cp.id }}
                    {{ cp.style_no ? ' · ' + cp.style_no : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Cutting Plan reference is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control" formControlName="style_no" readonly placeholder="Auto-filled from Order">
              </div>
            </div>

            <!-- Section 2: Line & Targets -->
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div class="section-title mb-0">
                <i class="bi bi-diagram-3 me-1"></i>Line & Production Targets
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="addTarget()">
                <i class="bi bi-plus-lg me-1"></i>Add Line & Production Target
              </button>
            </div>
            
            <div formArrayName="targets">
              <div *ngFor="let target of targetsArray.controls; let i = index" [formGroupName]="i" class="row g-3 mb-4 position-relative border rounded p-3 bg-light mt-2 mx-0">
                
                <button type="button" class="btn btn-sm btn-danger position-absolute" style="top: -10px; right: -10px; width: 32px; height: 32px; border-radius: 50%; z-index: 10;" (click)="removeTarget(i)" *ngIf="targetsArray.length > 1">
                  <i class="bi bi-trash"></i>
                </button>

                <div class="col-md-3">
                  <label class="form-label fw-semibold">Line No <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="line_no"
                    [class.is-invalid]="target.get('line_no')?.invalid && (target.get('line_no')?.dirty || target.get('line_no')?.touched)">
                    <option value="">— Select Line —</option>
                    <option *ngFor="let l of lines" [value]="l.lineName ?? l.lineId">
                      {{ l.lineName }} ({{ l.lineId }})
                    </option>
                  </select>
                  <div class="invalid-feedback">Line number is required.</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Target Quantity (pcs) <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" formControlName="target_quantity" min="1"
                    [class.is-invalid]="target.get('target_quantity')?.invalid && (target.get('target_quantity')?.dirty || target.get('target_quantity')?.touched)">
                  <div class="invalid-feedback">Must be at least 1.</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Achieved Quantity <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" formControlName="achieved_quantity" min="1"
                    placeholder="e.g. 500" [class.is-invalid]="target.get('achieved_quantity')?.invalid && (target.get('achieved_quantity')?.dirty || target.get('achieved_quantity')?.touched)">
                  <div class="invalid-feedback">Must be at least 1.</div>
                </div>
                <div class="col-md-3">
                  <label class="form-label fw-semibold">Rejection Qty</label>
                  <input type="number" class="form-control" formControlName="rejection_qty" min="0"
                    placeholder="e.g. 20">
                </div>
              </div>
            </div>

            <!-- Section 3: Schedule -->
            <div class="section-title mb-2">
              <i class="bi bi-calendar-range me-1"></i>Schedule & Supervisor
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Start Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="start_date"
                  [class.is-invalid]="isInvalid('start_date')">
                <div class="invalid-feedback">Start date is required.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">End Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="end_date"
                  [class.is-invalid]="isInvalid('end_date')">
                <div class="invalid-feedback">End date is required.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Assigned Supervisor</label>
                <input class="form-control" formControlName="assigned_supervisor" placeholder="e.g. Md. Kamal">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="status"
                  [class.is-invalid]="isInvalid('status')">
                  <option value="Pending">Pending</option>
                  <option value="Running">Running</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <!-- Section 4: Quantities -->
            <div class="section-title mb-2">
              <i class="bi bi-boxes me-1"></i>Quantity Tracking
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Input Received Qty (from Cutting)</label>
                <input type="number" class="form-control" formControlName="input_received_qty" min="0"
                  placeholder="Auto-filled from Cutting Plan">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Output Qty (Manufactured)</label>
                <input type="number" class="form-control" formControlName="output_qty" readonly
                  placeholder="Auto-summed from lines">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Rejection Qty</label>
                <input type="number" class="form-control" formControlName="rejection_qty" readonly
                  placeholder="Auto-summed from lines">
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
                  {{ submitting ? 'Saving...' : 'Save Sewing Plan' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #6c757d;
      border-left: 3px solid #2563eb;
      padding-left: 8px;
      margin-bottom: 10px;
    }
  `]
})
export class AddSewingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);
  private notify = inject(NotificationService);

  orders: any[] = [];
  cuttingPlans: any[] = [];
  lines: any[] = [];
  styles: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    order_id:           ['', Validators.required],
    cutting_plan_id:    ['', Validators.required],
    style_no:           [''],
    targets:            this.fb.array([this.createTargetRow()]),
    start_date:         [new Date().toISOString().substring(0, 10), Validators.required],
    end_date:           ['', Validators.required],
    assigned_supervisor:[''],
    input_received_qty: [null, Validators.min(0)],
    output_qty:         [null, Validators.min(0)],
    rejection_qty:      [null, Validators.min(0)],
    status:             ['Pending', Validators.required]
  });

  get targetsArray(): FormArray {
    return this.form.get('targets') as FormArray;
  }

  createTargetRow(): FormGroup {
    return this.fb.group({
      line_no: ['', Validators.required],
      target_quantity: [null, [Validators.required, Validators.min(1)]],
      achieved_quantity: [null, [Validators.required, Validators.min(1)]],
      rejection_qty: [null, Validators.min(0)]
    });
  }

  addTarget() {
    this.targetsArray.push(this.createTargetRow());
  }

  removeTarget(i: number) {
    if (this.targetsArray.length > 1) {
      this.targetsArray.removeAt(i);
    }
  }

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(data => this.orders = data);
    this.styleSvc.getStyles().subscribe(data => this.styles = data);
    this.svc.getLines().subscribe(data => this.lines = data);
    this.svc.getCuttingPlans().subscribe(data => this.cuttingPlans = data);

    // Real-time aggregation: sum achieved_quantity and rejection_qty across all target rows
    this.targetsArray.valueChanges.subscribe((rows: any[]) => {
      const totalOutput = rows.reduce((sum, r) => sum + (Number(r.achieved_quantity) || 0), 0);
      const totalRejection = rows.reduce((sum, r) => sum + (Number(r.rejection_qty) || 0), 0);
      this.form.patchValue(
        { output_qty: totalOutput || null, rejection_qty: totalRejection || null },
        { emitEvent: false }
      );
    });
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const sel = this.orders.find(o => (o.id ?? o.orderId) === orderId);
    if (sel) {
      let styleCode = sel.styleNo ?? sel.styleCode ?? '';
      
      // Look up style code if not directly on the order but we have styleId
      if (!styleCode && sel.styleId) {
        const foundStyle = this.styles.find(s => s.id === sel.styleId);
        if (foundStyle) {
          styleCode = foundStyle.styleCode;
        }
      }

      this.form.patchValue({
        style_no:        styleCode,
        end_date:        sel.endDate ?? ''
      });
      if (this.targetsArray.length > 0) {
        this.targetsArray.at(0).patchValue({
          target_quantity: sel.planQty ?? sel.quantity ?? null
        });
      }
      // Filter cutting plans for this order
      this.svc.getCuttingPlans().subscribe(plans => {
        this.cuttingPlans = plans.filter(p => (p.order_id ?? p.orderId) === orderId);
      });
    } else {
      this.form.patchValue({ style_no: '', end_date: '' });
      if (this.targetsArray.length > 0) {
        this.targetsArray.at(0).patchValue({ target_quantity: null });
      }
      this.svc.getCuttingPlans().subscribe(data => this.cuttingPlans = data);
    }
  }

  onCuttingPlanChange(event: any) {
    const cpId = event.target.value;
    const cp = this.cuttingPlans.find(p => (p.cutting_plan_id ?? p.id) === cpId);
    
    if (cp) {
      const actualQty = cp.actual_pieces ?? cp.actualCutQty ?? null;
      this.form.patchValue({ input_received_qty: actualQty });
    } else {
      this.form.patchValue({ input_received_qty: null });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      start_date: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    });
    while (this.targetsArray.length > 1) {
      this.targetsArray.removeAt(1);
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = {
      ...this.form.value,
      sewing_plan_id: 'SP-' + Date.now()
    };
    this.svc.createSewingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Sewing Plan created successfully');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
