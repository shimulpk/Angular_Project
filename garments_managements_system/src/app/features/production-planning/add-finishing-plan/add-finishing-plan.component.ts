import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-finishing-plan',
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
              <i class="bi bi-stars fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Finishing Plan</h5>
              <small class="text-white-50">Link a completed sewing plan → configure ironing, trimming, QC and schedule</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Sewing Plan Reference -->
            <div class="section-label mb-3">
              <i class="bi bi-link-45deg me-1"></i>Sewing Plan Reference (FK)
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Sewing Plan ID <span class="text-danger">*</span>
                  <small class="text-muted fw-normal ms-1">(Only Completed sewing plans shown)</small>
                </label>
                <select class="form-select" formControlName="sewing_plan_id"
                        (change)="onSewingPlanChange($event)"
                        [class.is-invalid]="isInvalid('sewing_plan_id')">
                  <option value="">— Select Completed Sewing Plan —</option>
                  <option *ngFor="let sp of completedSewingPlans" [value]="sp.sewing_plan_id ?? sp.id">
                    {{ sp.sewing_plan_id ?? sp.id }}
                    {{ sp.style_no ? ' · Style: ' + sp.style_no : '' }}
                    {{ sp.color ? ' · ' + sp.color : '' }}
                    {{ sp.output_qty ? ' · ' + sp.output_qty + ' pcs' : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Please select a completed sewing plan.</div>
                <div *ngIf="completedSewingPlans.length === 0" class="text-warning small mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>No completed sewing plans available yet.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Buyer Name</label>
                <input class="form-control bg-light" formControlName="buyer_name" readonly placeholder="Auto-filled from sewing plan">
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

            <!-- Auto-filled panel -->
            <div *ngIf="selectedSewingPlan" class="alert py-3 mb-4"
                 style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px;">
              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Sewing Output</div>
                  <div class="fw-bold text-success" style="font-size:1rem;">{{ selectedSewingPlan.output_qty | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Sewing Reject</div>
                  <div class="fw-bold text-danger" style="font-size:1rem;">{{ selectedSewingPlan.rejection_qty | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Start Date</div>
                  <div class="fw-bold" style="font-size:0.9rem;">{{ selectedSewingPlan.start_date | date:'mediumDate' }}</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">End Date</div>
                  <div class="fw-bold" style="font-size:0.9rem;">{{ selectedSewingPlan.end_date | date:'mediumDate' }}</div>
                </div>
              </div>
            </div>

            <!-- Section 3: Quantity Details -->
            <div class="section-label mb-3">
              <i class="bi bi-boxes me-1"></i>Quantity Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Input Qty (from Sewing) <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-arrow-down-circle text-primary"></i></span>
                  <input type="number" class="form-control bg-light" formControlName="input_qty" readonly
                         placeholder="Auto-filled from sewing plan">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="text-muted small mt-1">Auto-filled from selected sewing plan's output quantity</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Target Qty <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-bullseye text-warning"></i></span>
                  <input type="number" class="form-control" formControlName="target_qty" min="1"
                         [class.is-invalid]="isInvalid('target_qty')" placeholder="e.g. 1700">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="invalid-feedback">Target quantity must be at least 1.</div>
                <div class="text-muted small mt-1">Usually same as Input Qty; adjust if needed</div>
              </div>
            </div>

            <!-- Section 4: Finishing Process Required -->
            <div class="section-label mb-3">
              <i class="bi bi-toggles me-1"></i>Finishing Process Required
            </div>
            <div class="row g-3 mb-4">
              <div class="col-12">
                <div class="process-grid">
                  <div class="process-item" [class.active]="form.get('proc_trimming')?.value">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch"
                             id="proc_trimming" formControlName="proc_trimming">
                      <label class="form-check-label fw-semibold" for="proc_trimming">
                        <i class="bi bi-scissors me-1 text-primary"></i>Trimming
                      </label>
                    </div>
                  </div>
                  <div class="process-item" [class.active]="form.get('proc_ironing')?.value">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch"
                             id="proc_ironing" formControlName="proc_ironing">
                      <label class="form-check-label fw-semibold" for="proc_ironing">
                        <i class="bi bi-thermometer-sun me-1 text-danger"></i>Ironing
                      </label>
                    </div>
                  </div>
                  <div class="process-item" [class.active]="form.get('proc_washing')?.value">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch"
                             id="proc_washing" formControlName="proc_washing">
                      <label class="form-check-label fw-semibold" for="proc_washing">
                        <i class="bi bi-droplet me-1 text-info"></i>Washing
                      </label>
                    </div>
                  </div>
                  <div class="process-item" [class.active]="form.get('proc_button_attach')?.value">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" role="switch"
                             id="proc_button_attach" formControlName="proc_button_attach">
                      <label class="form-check-label fw-semibold" for="proc_button_attach">
                        <i class="bi bi-circle-half me-1 text-warning"></i>Button Attaching
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 5: Table/Line & Supervisor -->
            <div class="section-label mb-3">
              <i class="bi bi-people me-1"></i>Assignment & Schedule
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Finishing Table / Line No <span class="text-danger">*</span></label>
                <input class="form-control" formControlName="finishing_table_no"
                       [class.is-invalid]="isInvalid('finishing_table_no')"
                       placeholder="e.g. Table 1, Table 2, Line A">
                <div class="invalid-feedback">Table/Line No is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Supervisor Name <span class="text-danger">*</span></label>
                <input class="form-control" formControlName="supervisor_name"
                       [class.is-invalid]="isInvalid('supervisor_name')"
                       placeholder="e.g. Nasrin Akter">
                <div class="invalid-feedback">Supervisor name is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status</label>
                <input class="form-control bg-light" value="In Finishing" readonly>
                <div class="text-muted small mt-1">Auto-set to "In Finishing" on save</div>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Start Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="start_date"
                       [class.is-invalid]="isInvalid('start_date')">
                <div class="invalid-feedback">Start date is required.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">End Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="end_date"
                       [class.is-invalid]="isInvalid('end_date')">
                <div class="invalid-feedback">End date is required.</div>
              </div>
            </div>

            <!-- Info Banner -->
            <div class="alert alert-info d-flex align-items-start gap-2 py-2 mb-4"
                 style="border-radius:8px; font-size:0.85rem;">
              <i class="bi bi-info-circle-fill text-info mt-1"></i>
              <div>
                <strong>Auto Complete:</strong> When the total Pass Qty (from daily entries) reaches the Target Qty,
                the plan status will automatically change to <span class="badge bg-success">Completed</span> and
                unlock the <strong>Add Packing Plan</strong> module.
              </div>
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
    .process-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }
    .process-item {
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px 16px;
      background: #fafafa;
      transition: all 0.2s ease;
    }
    .process-item.active {
      border-color: #7c3aed;
      background: #faf5ff;
    }
    .form-check-input { width: 2.5em; height: 1.3em; cursor: pointer; }
    .form-check-input:checked { background-color: #7c3aed; border-color: #7c3aed; }
  `]
})
export class AddFinishingPlanComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  completedSewingPlans: any[] = [];
  selectedSewingPlan: any = null;
  submitting = false;

  form: FormGroup = this.fb.group({
    sewing_plan_id:      ['', Validators.required],
    buyer_name:          [''],
    order_no:            [''],
    style_no:            [''],
    color:               [''],
    input_qty:           [null],
    target_qty:          [null, [Validators.required, Validators.min(1)]],
    proc_trimming:       [false],
    proc_ironing:        [true],
    proc_washing:        [false],
    proc_button_attach:  [false],
    finishing_table_no:  ['', Validators.required],
    supervisor_name:     ['', Validators.required],
    start_date:          [new Date().toISOString().substring(0, 10), Validators.required],
    end_date:            ['', Validators.required],
    status:              ['In Finishing']
  });

  ngOnInit() {
    this.loadSewingPlans();
  }

  loadSewingPlans() {
    this.svc.getSewingPlans().subscribe(plans => {
      this.completedSewingPlans = plans.filter((p: any) =>
        p.status === 'Completed' || p.status === 'Sewing Done'
      );
    });
  }

  onSewingPlanChange(event: any) {
    const spId = event.target.value;
    this.selectedSewingPlan = this.completedSewingPlans.find(
      p => (p.sewing_plan_id ?? p.id) === spId
    ) || null;

    if (this.selectedSewingPlan) {
      const sp = this.selectedSewingPlan;
      const inputQty = Number(sp.output_qty) || 0;
      this.form.patchValue({
        buyer_name:  sp.buyer_name  || '',
        order_no:    sp.order_no    || '',
        style_no:    sp.style_no    || '',
        color:       sp.color       || '',
        input_qty:   inputQty,
        target_qty:  inputQty
      });
    } else {
      this.form.patchValue({
        buyer_name: '', order_no: '', style_no: '', color: '',
        input_qty: null, target_qty: null
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      start_date:         new Date().toISOString().substring(0, 10),
      status:             'In Finishing',
      proc_trimming:      false,
      proc_ironing:       true,
      proc_washing:       false,
      proc_button_attach: false
    });
    this.selectedSewingPlan = null;
    this.loadSewingPlans();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const payload = {
      ...this.form.value,
      finishing_plan_id: 'FP-' + Date.now(),
      status: 'In Finishing'
    };

    this.svc.createFinishingPlan(payload).subscribe({
      next: () => {
        this.notify.success('✅ Finishing Plan created successfully! Status set to "In Finishing".');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
