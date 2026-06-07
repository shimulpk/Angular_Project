import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { ApiService } from '../../../core/services/api/api.service';

@Component({
  selector: 'app-add-packing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">
        <!-- Header -->
        <div class="card-header border-0 py-4 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-box-seam fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Packing Plan</h5>
              <small class="text-white-50">Configure carton packaging method, pieces per carton, schedule and supervisor</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Finishing Plan Reference -->
            <div class="section-label mb-3">
              <i class="bi bi-link-45deg me-1"></i>Finishing Plan Reference
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Finishing Plan ID <span class="text-danger">*</span>
                  <small class="text-muted fw-normal ms-1">(Only Completed plans shown)</small>
                </label>
                <select class="form-select" formControlName="finishing_plan_id"
                        (change)="onFinishingPlanChange($event)"
                        [class.is-invalid]="isInvalid('finishing_plan_id')">
                  <option value="">— Select Completed Finishing Plan —</option>
                  <option *ngFor="let fp of completedFinishingPlans" [value]="fp.finishing_plan_id ?? fp.id">
                    {{ fp.finishing_plan_id ?? fp.id }}
                    {{ fp.style_no ? ' · Style: ' + fp.style_no : '' }}
                    {{ fp.color ? ' · ' + fp.color : '' }}
                    {{ fp.pass_qty ? ' · ' + fp.pass_qty + ' pcs' : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Please select a completed finishing plan.</div>
                <div *ngIf="completedFinishingPlans.length === 0" class="text-warning small mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>No completed finishing plans available yet.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Buyer Name</label>
                <input class="form-control bg-light" formControlName="buyer_name" readonly placeholder="Auto-filled from finishing plan">
              </div>
            </div>

            <!-- Section 2: Auto-filled Info -->
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order No</label>
                <input class="form-control bg-light" formControlName="order_no" readonly placeholder="Auto-filled">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control bg-light" formControlName="style_no" readonly placeholder="Auto-filled">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Color</label>
                <input class="form-control bg-light" formControlName="color" readonly placeholder="Auto-filled">
              </div>
            </div>

            <!-- Section 3: Quantity & Method Details -->
            <div class="section-label mb-3">
              <i class="bi bi-gear-wide-connected me-1"></i>Packing Specification & Calculations
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Total Order Qty (pcs) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-hash text-muted"></i></span>
                  <input type="number" class="form-control bg-light" formControlName="total_order_qty" readonly
                         placeholder="Auto-filled (Finished qty)">
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Packing Method <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="packing_method" [class.is-invalid]="isInvalid('packing_method')">
                  <option value="">— Select Method —</option>
                  <option value="Solid Packing">Solid Packing (one size per carton)</option>
                  <option value="Assorted Packing">Assorted Packing (mixed sizes per carton)</option>
                </select>
                <div class="invalid-feedback">Packing method is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Pcs Per Carton <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="pcs_per_carton" min="1"
                       (input)="calculateCartons()"
                       [class.is-invalid]="isInvalid('pcs_per_carton')" placeholder="e.g. 24 or 48">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Total Planned Cartons</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="bi bi-box text-muted"></i></span>
                  <input type="number" class="form-control bg-light" formControlName="total_planned_cartons" readonly
                         placeholder="Auto-calculated (Order Qty / Pcs per Carton)">
                </div>
                <div class="text-muted small mt-1">Calculated as: Total Order Qty / Pcs Per Carton (rounded up)</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Carton Supplier <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="carton_supplier" [class.is-invalid]="isInvalid('carton_supplier')">
                  <option value="">— Select Supplier —</option>
                  <option *ngFor="let s of cartonSuppliers" [value]="s">{{ s }}</option>
                </select>
                <div class="invalid-feedback">Carton Supplier is required.</div>
              </div>
            </div>

            <!-- Section 4: Assignment & Dates -->
            <div class="section-label mb-3">
              <i class="bi bi-people me-1"></i>Assignment & Schedule
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Packing Supervisor <span class="text-danger">*</span></label>
                <input class="form-control" formControlName="packing_supervisor"
                       [class.is-invalid]="isInvalid('packing_supervisor')"
                       placeholder="e.g. Asaduzzaman">
                <div class="invalid-feedback">Packing Supervisor name is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Start Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="start_date"
                       [class.is-invalid]="isInvalid('start_date')">
                <div class="invalid-feedback">Start date is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Expected Shipment Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="expected_shipment_date"
                       [class.is-invalid]="isInvalid('expected_shipment_date')">
                <div class="invalid-feedback">Expected shipment date is required.</div>
              </div>
            </div>

            <!-- Status Info Banner -->
            <div class="alert alert-info py-2 px-3 mb-4" style="border-radius:8px; font-size:0.85rem;">
              <i class="bi bi-info-circle-fill text-info me-2"></i>
              This Packing Plan will start with status <strong>"In Packing"</strong> and will auto-calculate actual progress from day-wise entries.
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-5" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  {{ submitting ? 'Saving...' : 'Save Packing Plan' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6c757d;
      border-left: 3px solid #7c3aed;
      padding-left: 8px;
      margin-bottom: 12px;
      margin-top: 4px;
    }
  `]
})
export class AddPackingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private api = inject(ApiService);
  private notify = inject(NotificationService);

  completedFinishingPlans: any[] = [];
  selectedFinishingPlan: any = null;
  submitting = false;

  cartonSuppliers: string[] = [
    'Golden Carton Ltd',
    'PackTech Bangladesh',
    'Elite Packaging',
    'Standard Cartons Inc',
    'Salma Textiles & Packing',
    'Sardar Carton Industries'
  ];

  form: FormGroup = this.fb.group({
    finishing_plan_id:      ['', Validators.required],
    buyer_name:             [''],
    order_no:               [''],
    style_no:               [''],
    color:                  [''],
    total_order_qty:        [null, [Validators.required, Validators.min(1)]],
    packing_method:         ['', Validators.required],
    pcs_per_carton:         [null, [Validators.required, Validators.min(1)]],
    total_planned_cartons:  [null],
    carton_supplier:        ['', Validators.required],
    packing_supervisor:     ['', Validators.required],
    start_date:             [new Date().toISOString().substring(0, 10), Validators.required],
    expected_shipment_date: ['', Validators.required]
  });

  ngOnInit() {
    this.loadFinishingPlans();
    this.loadCartonSuppliersFromDb();
  }

  loadFinishingPlans() {
    this.svc.getFinishingPlans().subscribe(plans => {
      this.completedFinishingPlans = plans.filter((p: any) => p.status === 'Completed');
    });
  }

  loadCartonSuppliersFromDb() {
    this.api.getAll<any>('vendors').subscribe({
      next: (vendors) => {
        if (vendors && vendors.length > 0) {
          const names = vendors.map(v => v.companyName).filter(Boolean);
          if (names.length > 0) {
            // merge with existing, unique only
            this.cartonSuppliers = Array.from(new Set([...this.cartonSuppliers, ...names]));
          }
        }
      },
      error: () => {}
    });
  }

  onFinishingPlanChange(event: any) {
    const fpId = event.target.value;
    this.selectedFinishingPlan = this.completedFinishingPlans.find(
      p => (p.finishing_plan_id ?? p.id) === fpId
    ) || null;

    if (this.selectedFinishingPlan) {
      const fp = this.selectedFinishingPlan;
      // pass_qty or target_qty can act as order qty. Let's use pass_qty if available, fallback to target_qty
      const qty = Number(fp.pass_qty) || Number(fp.target_qty) || 0;
      this.form.patchValue({
        buyer_name:      fp.buyer_name || '',
        order_no:        fp.order_no || fp.order_id || '',
        style_no:        fp.style_no || '',
        color:           fp.color || '',
        total_order_qty: qty
      });
      this.calculateCartons();
    } else {
      this.form.patchValue({
        buyer_name: '', order_no: '', style_no: '', color: '', total_order_qty: null, total_planned_cartons: null
      });
    }
  }

  calculateCartons() {
    const qty = Number(this.form.get('total_order_qty')?.value) || 0;
    const perCarton = Number(this.form.get('pcs_per_carton')?.value) || 0;
    if (qty > 0 && perCarton > 0) {
      this.form.patchValue({
        total_planned_cartons: Math.ceil(qty / perCarton)
      });
    } else {
      this.form.patchValue({
        total_planned_cartons: null
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      start_date: new Date().toISOString().substring(0, 10)
    });
    this.selectedFinishingPlan = null;
    this.loadFinishingPlans();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const payload = {
      ...this.form.value,
      packing_plan_id: 'PKG-' + Date.now(),
      status: 'In Packing'
    };

    this.svc.createPackingPlan(payload).subscribe({
      next: () => {
        this.notify.success('✅ Packing Plan created successfully! Status set to "In Packing".');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
