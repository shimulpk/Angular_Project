import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-day-wise-finishing-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">
        <!-- Header -->
        <div class="card-header border-0 py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-calendar-plus fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Day Wise Finishing Production</h5>
              <small class="text-white-50">Daily finishing output log — pass qty, rejection & remarks</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Plan Selection -->
            <div class="section-label mb-3">
              <i class="bi bi-card-checklist me-1"></i>Plan & Date Selection
            </div>
            <div class="row g-3 mb-4">
              <!-- Date -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="date"
                       [class.is-invalid]="isInvalid('date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>

              <!-- Select Finishing Plan ID (FK) -->
              <div class="col-md-8">
                <label class="form-label fw-semibold">Select Finishing Plan <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="finishing_plan_id"
                        (change)="onPlanChange($event)"
                        [class.is-invalid]="isInvalid('finishing_plan_id')">
                  <option value="">— Select Finishing Plan —</option>
                  <option *ngFor="let fp of activePlans" [value]="fp.finishing_plan_id ?? fp.id">
                    {{ fp.finishing_plan_id ?? fp.id }}
                    {{ fp.style_no ? ' · Style: ' + fp.style_no : '' }}
                    {{ fp.buyer_name ? ' · ' + fp.buyer_name : '' }}
                    · Target: {{ fp.target_qty | number }} pcs
                  </option>
                </select>
                <div class="invalid-feedback">Finishing Plan selection is required.</div>
                <div *ngIf="activePlans.length === 0" class="text-warning small mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>No active finishing plans found.
                </div>
              </div>
            </div>

            <!-- Plan Summary Panel -->
            <div *ngIf="selectedPlan" class="alert py-3 mb-4"
                 style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:10px;">
              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Input Qty</div>
                  <div class="fw-bold text-primary" style="font-size:0.95rem;">{{ selectedPlan.input_qty | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Target Qty</div>
                  <div class="fw-bold" style="font-size:0.95rem;">{{ selectedPlan.target_qty | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Total Passed So Far</div>
                  <div class="fw-bold text-success" style="font-size:0.95rem;">{{ totalPassedSoFar | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Remaining</div>
                  <div class="fw-bold" [ngClass]="remaining > 0 ? 'text-warning' : 'text-success'"
                       style="font-size:0.95rem;">{{ remaining | number }} pcs</div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mt-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Finishing Progress</span>
                  <span>{{ progressPct }}%</span>
                </div>
                <div class="progress" style="height:10px; border-radius:6px;">
                  <div class="progress-bar"
                       [ngClass]="progressPct >= 100 ? 'bg-success' : progressPct >= 60 ? 'bg-primary' : 'bg-warning'"
                       role="progressbar"
                       [style.width.%]="progressPct"
                       aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
              </div>

              <!-- Plan Info Row -->
              <div class="row g-2 mt-2 text-center">
                <div class="col-4">
                  <div class="text-muted" style="font-size:0.7rem; text-transform:uppercase; font-weight:600;">Buyer</div>
                  <div class="small fw-semibold">{{ selectedPlan.buyer_name || 'N/A' }}</div>
                </div>
                <div class="col-4">
                  <div class="text-muted" style="font-size:0.7rem; text-transform:uppercase; font-weight:600;">Style No</div>
                  <div class="small fw-semibold">{{ selectedPlan.style_no || 'N/A' }}</div>
                </div>
                <div class="col-4">
                  <div class="text-muted" style="font-size:0.7rem; text-transform:uppercase; font-weight:600;">Supervisor</div>
                  <div class="small fw-semibold">{{ selectedPlan.supervisor_name || 'N/A' }}</div>
                </div>
              </div>
            </div>

            <!-- Section 2: Daily Production Entry -->
            <div class="section-label mb-3">
              <i class="bi bi-pencil-square me-1"></i>Today's Finishing Output
            </div>
            <div class="row g-3 mb-4">
              <!-- Today's Pass Qty -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Today's Pass Qty <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-check-circle text-success"></i></span>
                  <input type="number" class="form-control" formControlName="pass_qty"
                         min="0" placeholder="e.g. 1500"
                         [class.is-invalid]="isInvalid('pass_qty')">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="invalid-feedback d-block" *ngIf="isInvalid('pass_qty')">
                  Pass quantity is required and must be ≥ 0.
                </div>
                <div class="text-muted small mt-1">
                  Pieces that passed final ironing + QC inspection today
                </div>
              </div>

              <!-- Today's Reject Qty -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Today's Reject Qty</label>
                <div class="input-group">
                  <span class="input-group-text text-danger"><i class="bi bi-x-circle"></i></span>
                  <input type="number" class="form-control" formControlName="reject_qty"
                         min="0" placeholder="e.g. 10">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="text-muted small mt-1">
                  Pieces with critical defects found in final QC — permanently rejected
                </div>
              </div>
            </div>

            <!-- Remarks -->
            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="form-label fw-semibold">Remarks / Notes</label>
                <textarea class="form-control" formControlName="remarks" rows="3"
                          placeholder="e.g. Button machine had issue today; 200 pcs rescheduled to tomorrow..."></textarea>
              </div>
            </div>

            <!-- Auto-complete Info Banner -->
            <div class="alert alert-warning d-flex align-items-start gap-2 py-2 mb-4"
                 style="border-radius:8px; font-size:0.85rem;">
              <i class="bi bi-lightning-fill text-warning mt-1"></i>
              <div>
                <strong>Auto Complete:</strong>
                When total pass qty equals or exceeds plan target
                ({{ selectedPlan?.target_qty || 'Target Qty' | number }} pcs), the plan status will auto-update to
                <span class="badge bg-success">Completed</span> and unlock the
                <strong>Add Packing Plan</strong> module.
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
                  Save Production Entry
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
export class AddDayWiseFinishingProductionComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  activePlans: any[] = [];
  allDailyRecords: any[] = [];

  selectedPlan: any = null;
  totalPassedSoFar = 0;
  progressPct = 0;
  remaining = 0;
  submitting = false;

  form: FormGroup = this.fb.group({
    date:               [new Date().toISOString().substring(0, 10), Validators.required],
    finishing_plan_id:  ['', Validators.required],
    pass_qty:           [null, [Validators.required, Validators.min(0)]],
    reject_qty:         [0, [Validators.min(0)]],
    remarks:            ['']
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans: this.svc.getFinishingPlans(),
      daily: this.svc.getDayWiseFinishingProduction()
    }).subscribe({
      next: ({ plans, daily }) => {
        // Only show plans that are actively in finishing (not yet completed)
        this.activePlans = plans.filter((p: any) =>
          p.status === 'In Finishing' || p.status === 'Pending' || p.status === 'Running'
        );
        this.allDailyRecords = daily;
      }
    });
  }

  onPlanChange(event: any) {
    const fpId = event.target.value;
    this.selectedPlan = this.activePlans.find(
      p => (p.finishing_plan_id ?? p.id) === fpId
    ) || null;
    this.recalcStats();
  }

  recalcStats() {
    if (!this.selectedPlan) {
      this.totalPassedSoFar = 0;
      this.progressPct = 0;
      this.remaining = 0;
      return;
    }
    const fpId = this.selectedPlan.finishing_plan_id ?? this.selectedPlan.id;
    const prevRecords = this.allDailyRecords.filter(
      r => (r.finishing_plan_id || r.plan_id) === fpId
    );
    this.totalPassedSoFar = prevRecords.reduce((sum, r) => sum + (Number(r.pass_qty) || 0), 0);
    const target = Number(this.selectedPlan.target_qty) || 1;
    this.remaining = Math.max(0, target - this.totalPassedSoFar);
    this.progressPct = Math.min(100, Math.round((this.totalPassedSoFar / target) * 100));
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      date: new Date().toISOString().substring(0, 10),
      finishing_plan_id: '',
      reject_qty: 0,
      remarks: ''
    });
    this.selectedPlan = null;
    this.totalPassedSoFar = 0;
    this.progressPct = 0;
    this.remaining = 0;
    this.loadData();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const val = this.form.value;
    const todayPass   = Number(val.pass_qty) || 0;
    const todayReject = Number(val.reject_qty) || 0;

    const dailyRecord = {
      finishing_plan_id: val.finishing_plan_id,
      plan_id:           val.finishing_plan_id,
      date:              val.date,
      pass_qty:          todayPass,
      reject_qty:        todayReject,
      remarks:           val.remarks || '',
      style_no:          this.selectedPlan?.style_no || '',
      buyer_name:        this.selectedPlan?.buyer_name || ''
    };

    this.svc.createDayWiseFinishingProduction(dailyRecord).subscribe({
      next: () => {
        // Recalculate cumulative pass & reject for this plan
        const fpId = this.selectedPlan.finishing_plan_id ?? this.selectedPlan.id;
        const siblingRecords = this.allDailyRecords.filter(
          r => (r.finishing_plan_id || r.plan_id) === fpId
        );
        const cumPass   = siblingRecords.reduce((sum, r) => sum + (Number(r.pass_qty) || 0), 0) + todayPass;
        const cumReject = siblingRecords.reduce((sum, r) => sum + (Number(r.reject_qty) || 0), 0) + todayReject;
        const target    = Number(this.selectedPlan.target_qty) || 0;
        const willComplete = target > 0 && cumPass >= target;

        const updatedPlan = {
          ...this.selectedPlan,
          pass_qty:      cumPass,
          rejection_qty: cumReject,
          status: willComplete ? 'Completed' : this.selectedPlan.status
        };

        this.svc.updateFinishingPlan(this.selectedPlan.id, updatedPlan).subscribe({
          next: () => {
            if (willComplete) {
              this.notify.success(`🎉 Production saved! Finishing Plan ${fpId} is now COMPLETED. Packing module is now unlocked!`);
            } else {
              this.notify.success(`✅ Production logged. Total Pass: ${cumPass} / ${target} pcs`);
            }
            this.resetForm();
            this.submitting = false;
          },
          error: () => {
            this.notify.success('Production saved, but failed to update finishing plan totals.');
            this.resetForm();
            this.submitting = false;
          }
        });
      },
      error: () => {
        this.notify.error('Failed to log daily finishing production.');
        this.submitting = false;
      }
    });
  }
}
