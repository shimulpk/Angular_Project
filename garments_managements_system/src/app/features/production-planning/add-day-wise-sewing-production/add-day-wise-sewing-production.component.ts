import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-day-wise-sewing-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">
        <!-- Header -->
        <div class="card-header border-0 py-4 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-calendar-plus fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Day Wise Sewing Production</h5>
              <small class="text-white-50">Log daily line production output for sewing plans</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Selection -->
            <div class="section-label mb-3">
              <i class="bi bi-card-checklist me-1"></i>Plan & Line Selection
            </div>
            <div class="row g-3 mb-4">
              <!-- Date -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="date"
                       [class.is-invalid]="isInvalid('date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>

              <!-- Select Sewing Plan ID (FK) -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Select Sewing Plan <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="sewing_plan_id"
                        (change)="onPlanChange($event)"
                        [class.is-invalid]="isInvalid('sewing_plan_id')">
                  <option value="">— Select Sewing Plan —</option>
                  <option *ngFor="let sp of activePlans" [value]="sp.sewing_plan_id ?? sp.id">
                    {{ sp.sewing_plan_id ?? sp.id }}
                    {{ sp.style_no ? ' · Style: ' + sp.style_no : '' }}
                    {{ sp.color ? ' · ' + sp.color : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Sewing Plan selection is required.</div>
              </div>

              <!-- Select Line -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Select Line <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="line_no"
                        (change)="onLineChange($event)"
                        [class.is-invalid]="isInvalid('line_no')">
                  <option value="">— Select Line —</option>
                  <option *ngFor="let target of planLines" [value]="target.line_no">
                    {{ target.line_no }} (Target: {{ target.target_quantity }})
                  </option>
                </select>
                <div class="invalid-feedback">Line selection is required.</div>
              </div>
            </div>

            <!-- Selected Line Details Panel -->
            <div *ngIf="selectedPlan && selectedLineTarget" class="alert py-3 mb-4"
                 style="background:#eef4ff; border:1px solid #c7d8f8; border-radius:10px;">
              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Plan Input</div>
                  <div class="fw-bold text-primary" style="font-size:0.95rem;">
                    {{ selectedPlan.input_received_qty | number }} pcs
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Line Target</div>
                  <div class="fw-bold" style="font-size:0.95rem;">
                    {{ selectedLineTarget.target_quantity | number }} pcs
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Achieved So Far</div>
                  <div class="fw-bold text-success" style="font-size:0.95rem;">
                    {{ lineAchievedTotal | number }} pcs
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Remaining</div>
                  <div class="fw-bold" [ngClass]="lineRemaining > 0 ? 'text-warning' : 'text-success'"
                       style="font-size:0.95rem;">
                    {{ lineRemaining | number }} pcs
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Line Completion Progress</span>
                  <span>{{ lineProgressPct }}%</span>
                </div>
                <div class="progress" style="height:8px; border-radius:6px;">
                  <div class="progress-bar"
                       [ngClass]="lineProgressPct >= 100 ? 'bg-success' : lineProgressPct >= 60 ? 'bg-primary' : 'bg-warning'"
                       role="progressbar"
                       [style.width.%]="lineProgressPct"
                       aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: Daily Entry -->
            <div class="section-label mb-3">
              <i class="bi bi-pencil-square me-1"></i>Today's Sewing Output
            </div>
            <div class="row g-3 mb-4">
              <!-- Today's Achieved Qty -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Today's Achieved Qty <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-check-circle text-success"></i></span>
                  <input type="number" class="form-control" formControlName="achieved_quantity"
                         min="0" placeholder="e.g. 800"
                         [class.is-invalid]="isInvalid('achieved_quantity')">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="invalid-feedback d-block" *ngIf="isInvalid('achieved_quantity')">
                  Achieved quantity is required.
                </div>
              </div>

              <!-- Today's Reject Qty -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Today's Reject Qty</label>
                <div class="input-group">
                  <span class="input-group-text text-danger"><i class="bi bi-x-circle"></i></span>
                  <input type="number" class="form-control" formControlName="rejection_qty"
                         min="0" placeholder="e.g. 5">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
              </div>
            </div>

            <!-- Auto Close info banner -->
            <div class="alert alert-warning d-flex align-items-start gap-2 py-2 mb-4"
                 style="border-radius:8px; font-size:0.85rem;">
              <i class="bi bi-lightning-fill text-warning mt-1"></i>
              <div>
                <strong>Auto Close:</strong>
                When cumulative Achieved sewing quantity across all lines equals or exceeds the plan's input quantity ({{ selectedPlan?.input_received_qty || 'Input Received Qty' }} pcs), the plan status will update to
                <span class="badge bg-success">Completed</span> automatically.
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
                  Save Production
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
      border-left: 3px solid #2563eb;
      padding-left: 8px;
      margin-bottom: 12px;
      margin-top: 4px;
    }
  `]
})
export class AddDayWiseSewingProductionComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  activePlans: any[] = [];
  allDailyRecords: any[] = [];
  planLines: any[] = [];

  selectedPlan: any = null;
  selectedLineTarget: any = null;
  lineAchievedTotal = 0;
  lineProgressPct = 0;
  lineRemaining = 0;
  submitting = false;

  form: FormGroup = this.fb.group({
    date:              [new Date().toISOString().substring(0, 10), Validators.required],
    sewing_plan_id:    ['', Validators.required],
    line_no:           ['', Validators.required],
    achieved_quantity: [null, [Validators.required, Validators.min(0)]],
    rejection_qty:     [0, [Validators.min(0)]]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans: this.svc.getSewingPlans(),
      daily: this.svc.getDayWiseSewingProduction()
    }).subscribe({
      next: ({ plans, daily }) => {
        // Show plans that are not completed yet
        this.activePlans = plans.filter((p: any) => p.status !== 'Completed' && p.status !== 'Sewing Done');
        this.allDailyRecords = daily;
      }
    });
  }

  onPlanChange(event: any) {
    const spId = event.target.value;
    this.selectedPlan = this.activePlans.find(p => (p.sewing_plan_id ?? p.id) === spId) || null;
    this.planLines = this.selectedPlan ? (this.selectedPlan.targets || []) : [];
    this.selectedLineTarget = null;
    this.form.patchValue({ line_no: '', achieved_quantity: null, rejection_qty: 0 });
    this.resetStats();
  }

  onLineChange(event: any) {
    const lineNo = event.target.value;
    this.selectedLineTarget = this.planLines.find(l => l.line_no === lineNo) || null;
    this.recalcStats();
  }

  resetStats() {
    this.lineAchievedTotal = 0;
    this.lineProgressPct = 0;
    this.lineRemaining = 0;
  }

  recalcStats() {
    if (!this.selectedPlan || !this.selectedLineTarget) {
      this.resetStats();
      return;
    }
    const spId = this.selectedPlan.sewing_plan_id ?? this.selectedPlan.id;
    const lineNo = this.selectedLineTarget.line_no;
    
    // Sum previous achievements for this line under this plan
    const prev = this.allDailyRecords.filter(r => 
      (r.sewing_plan_id || r.plan_id) === spId && r.line_no === lineNo
    );
    this.lineAchievedTotal = prev.reduce((sum, r) => sum + (Number(r.achieved_quantity) || 0), 0);
    const target = Number(this.selectedLineTarget.target_quantity) || 1;
    
    this.lineRemaining = Math.max(0, target - this.lineAchievedTotal);
    this.lineProgressPct = Math.min(100, Math.round((this.lineAchievedTotal / target) * 100));
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      date: new Date().toISOString().substring(0, 10),
      sewing_plan_id: '',
      line_no: '',
      rejection_qty: 0
    });
    this.selectedPlan = null;
    this.selectedLineTarget = null;
    this.planLines = [];
    this.resetStats();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const val = this.form.value;
    const todayAchieved = Number(val.achieved_quantity) || 0;
    const todayReject = Number(val.rejection_qty) || 0;

    const dailyRecord = {
      sewing_plan_id:    val.sewing_plan_id,
      plan_id:           val.sewing_plan_id,
      date:              val.date,
      line_no:           val.line_no,
      achieved_quantity: todayAchieved,
      rejection_qty:     todayReject,
      style_no:          this.selectedPlan?.style_no || '',
      order_no:          this.selectedPlan?.order_no || ''
    };

    // Save daily production
    this.svc.createDayWiseSewingProduction(dailyRecord).subscribe({
      next: () => {
        // Recalculate total achieved for the entire plan
        const spId = this.selectedPlan.sewing_plan_id ?? this.selectedPlan.id;
        const targetAll = Number(this.selectedPlan.input_received_qty) || 0;

        const siblingRecords = this.allDailyRecords.filter(r => (r.sewing_plan_id || r.plan_id) === spId);
        const cumAchieved = siblingRecords.reduce((sum, r) => sum + (Number(r.achieved_quantity) || 0), 0) + todayAchieved;
        const cumReject = siblingRecords.reduce((sum, r) => sum + (Number(r.rejection_qty) || 0), 0) + todayReject;

        const willComplete = targetAll > 0 && cumAchieved >= targetAll;

        // Update sewing plan totals in db (for backward compatibility and easy lookup)
        const updatedPlan = { 
          ...this.selectedPlan, 
          output_qty: cumAchieved,
          rejection_qty: cumReject,
          status: willComplete ? 'Completed' : this.selectedPlan.status 
        };

        this.svc.updateSewingPlan(this.selectedPlan.id, updatedPlan).subscribe({
          next: () => {
            if (willComplete) {
              this.notify.success(`🎉 Production saved! Sewing Plan ${spId} is now COMPLETED.`);
            } else {
              this.notify.success(`Production logged. Overall: ${cumAchieved} / ${targetAll} pcs`);
            }
            this.resetForm();
            this.loadData();
            this.submitting = false;
          },
          error: () => {
            this.notify.success('Production saved, but failed to update sewing plan totals.');
            this.resetForm();
            this.loadData();
            this.submitting = false;
          }
        });
      },
      error: () => {
        this.notify.error('Failed to log daily production.');
        this.submitting = false;
      }
    });
  }
}
