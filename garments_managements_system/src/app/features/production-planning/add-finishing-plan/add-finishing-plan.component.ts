import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { StyleService } from '../../../core/services/style.service';

@Component({
  selector: 'app-add-finishing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <!-- Header -->
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-bookmark-star me-2"></i>Add Finishing Plan</h5>
          <small class="text-white-50">Link sewing plan → manage ironing, QC, labelling and pass/fail tracking</small>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: FK References -->
            <div class="section-title mb-2">
              <i class="bi bi-link-45deg me-1"></i>Order & Sewing Plan Reference
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
                <label class="form-label fw-semibold">Sewing Plan ID (FK) <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="sewing_plan_id"
                  (change)="onSewingPlanChange($event)"
                  [class.is-invalid]="isInvalid('sewing_plan_id')">
                  <option value="">— Select Sewing Plan —</option>
                  <option *ngFor="let sp of sewingPlans" [value]="sp.sewing_plan_id ?? sp.id">
                    {{ sp.sewing_plan_id ?? sp.id }}
                    {{ sp.style_no ? ' · ' + sp.style_no : '' }}
                    {{ sp.line_no ? ' · Line ' + sp.line_no : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Sewing Plan reference is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control" formControlName="style_no" readonly placeholder="Auto-filled from Order">
              </div>
            </div>

            <!-- Section 2: Quantity Inputs -->
            <div class="section-title mb-2">
              <i class="bi bi-boxes me-1"></i>Quantity Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Input Qty (from Sewing) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="input_qty" min="1"
                  [class.is-invalid]="isInvalid('input_qty')" placeholder="e.g. 1100">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Target Qty <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="target_qty" min="1"
                  [class.is-invalid]="isInvalid('target_qty')" placeholder="e.g. 1080">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Pass Qty</label>
                <input type="number" class="form-control" formControlName="pass_qty" min="0" placeholder="e.g. 1060">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Rejection Qty</label>
                <input type="number" class="form-control" formControlName="rejection_qty" min="0" placeholder="e.g. 20">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Ironing Type <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="ironing_type"
                  [class.is-invalid]="isInvalid('ironing_type')">
                  <option value="">— Select Type —</option>
                  <option value="Steam Iron">Steam Iron</option>
                  <option value="Dry Iron">Dry Iron</option>
                  <option value="Tunnel Finisher">Tunnel Finisher</option>
                  <option value="Press Table">Press Table</option>
                  <option value="None">None</option>
                </select>
                <div class="invalid-feedback">Ironing type is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Quality Check Result <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="quality_check"
                  [class.is-invalid]="isInvalid('quality_check')">
                  <option value="">— Select QC Result —</option>
                  <option value="QC Pass">QC Pass</option>
                  <option value="QC Fail">QC Fail</option>
                  <option value="Pending">Pending</option>
                </select>
                <div class="invalid-feedback">Quality check result is required.</div>
              </div>
            </div>

            <!-- Section 3: Process Toggles -->
            <div class="section-title mb-2">
              <i class="bi bi-toggles me-1"></i>Process Requirements
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold d-block">Thread Cutting Required</label>
                <div class="form-check form-switch mt-1">
                  <input class="form-check-input" type="checkbox" role="switch"
                    id="threadCuttingToggle" formControlName="thread_cutting">
                  <label class="form-check-label" for="threadCuttingToggle">
                    {{ form.get('thread_cutting')?.value ? 'Yes' : 'No' }}
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold d-block">Button Attachment Required</label>
                <div class="form-check form-switch mt-1">
                  <input class="form-check-input" type="checkbox" role="switch"
                    id="buttonAttachToggle" formControlName="button_attach">
                  <label class="form-check-label" for="buttonAttachToggle">
                    {{ form.get('button_attach')?.value ? 'Yes' : 'No' }}
                  </label>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold d-block">Label Attachment Required</label>
                <div class="form-check form-switch mt-1">
                  <input class="form-check-input" type="checkbox" role="switch"
                    id="labelAttachToggle" formControlName="label_attach">
                  <label class="form-check-label" for="labelAttachToggle">
                    {{ form.get('label_attach')?.value ? 'Yes' : 'No' }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section 4: Schedule & Assignment -->
            <div class="section-title mb-2">
              <i class="bi bi-calendar-range me-1"></i>Schedule & Assignment
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
                <label class="form-label fw-semibold">Assigned To</label>
                <input class="form-control" formControlName="assigned_to" placeholder="e.g. Nasrin Akter">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="status"
                  [class.is-invalid]="isInvalid('status')">
                  <option value="Pending">Pending</option>
                  <option value="Running">Running</option>
                  <option value="Done">Done</option>
                </select>
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
                  {{ submitting ? 'Saving...' : 'Save Finishing Plan' }}
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
    .form-check-input { width: 2.5em; height: 1.3em; cursor: pointer; }
    .form-check-input:checked { background-color: #2563eb; border-color: #2563eb; }
  `]
})
export class AddFinishingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);
  private notify = inject(NotificationService);

  orders: any[] = [];
  sewingPlans: any[] = [];
  styles: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    order_id:       ['', Validators.required],
    sewing_plan_id: ['', Validators.required],
    style_no:       [''],
    input_qty:      [null, [Validators.required, Validators.min(1)]],
    target_qty:     [null, [Validators.required, Validators.min(1)]],
    pass_qty:       [null, Validators.min(0)],
    rejection_qty:  [null, Validators.min(0)],
    ironing_type:   ['', Validators.required],
    quality_check:  ['', Validators.required],
    thread_cutting: [false],
    button_attach:  [false],
    label_attach:   [false],
    start_date:     [new Date().toISOString().substring(0, 10), Validators.required],
    end_date:       ['', Validators.required],
    assigned_to:    [''],
    status:         ['Pending', Validators.required]
  });

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(data => this.orders = data);
    this.styleSvc.getStyles().subscribe(data => this.styles = data);
    this.svc.getSewingPlans().subscribe(data => this.sewingPlans = data);
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
        style_no:   styleCode,
        end_date:   sel.endDate ?? ''
      });

      this.svc.getSewingPlans().subscribe(plans => {
        const matchingPlans = plans.filter(p => (p.order_id ?? p.orderId) === orderId);
        this.sewingPlans = matchingPlans;
        
        // If sewing plans exist for this order, auto-calculate input/target qty
        if (matchingPlans.length > 0) {
          const totalOutput = matchingPlans.reduce((sum, p) => sum + (Number(p.output_qty) || 0), 0);
          
          this.form.patchValue({
            input_qty: totalOutput > 0 ? totalOutput : null,
            target_qty: totalOutput > 0 ? totalOutput : (sel.planQty ?? sel.quantity ?? null)
          });

          // Auto-select the sewing plan if there is only one
          if (matchingPlans.length === 1) {
             const sp = matchingPlans[0];
             this.form.patchValue({ sewing_plan_id: sp.sewing_plan_id ?? sp.id });
          }
        } else {
          // Fallback if no sewing plan is found
          this.form.patchValue({
            input_qty: null,
            target_qty: sel.planQty ?? sel.quantity ?? null
          });
        }
      });
    } else {
      this.form.patchValue({ style_no: '', target_qty: null, input_qty: null, end_date: '', sewing_plan_id: '' });
      this.svc.getSewingPlans().subscribe(data => this.sewingPlans = data);
    }
  }

  onSewingPlanChange(event: any) {
    const spId = event.target.value;
    const sp = this.sewingPlans.find(p => (p.sewing_plan_id ?? p.id) === spId);
    if (sp) {
      this.form.patchValue({
        input_qty: sp.output_qty || null,
        target_qty: sp.output_qty || null
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      start_date:     new Date().toISOString().substring(0, 10),
      status:         'Pending',
      thread_cutting: false,
      button_attach:  false,
      label_attach:   false
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = {
      ...this.form.value,
      finishing_plan_id: 'FP-' + Date.now()
    };
    this.svc.createFinishingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Finishing Plan created successfully');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
