import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-day-wise-cutting-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">

        <!-- Header -->
        <div class="card-header border-0 py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-calendar-plus fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Day Wise Cutting Production</h5>
              <small class="text-white-50">Log daily actual cutting output against a plan</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- ── Section 1: Plan Selection ──────────────────────── -->
            <div class="section-label">
              <i class="bi bi-card-checklist me-1"></i>Plan Selection
            </div>
            <div class="row g-3 mb-4">

              <!-- Date (default today, editable for back-entry) -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">
                  Date <span class="text-danger">*</span>
                  <span class="badge bg-light text-muted fw-normal ms-1 small">Back-date allowed</span>
                </label>
                <input type="date" class="form-control" formControlName="date"
                       [class.is-invalid]="isInvalid('date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>

              <!-- Select Cutting Plan ID (FK) — only Pending plans -->
              <div class="col-md-8">
                <label class="form-label fw-semibold">
                  Select Cutting Plan <span class="text-danger">*</span>
                  <span class="badge bg-warning text-dark fw-normal ms-1 small">Only active (Pending) plans</span>
                </label>
                <select class="form-select" formControlName="cutting_plan_id"
                        [class.is-invalid]="isInvalid('cutting_plan_id')"
                        (change)="onPlanChange($event)">
                  <option value="">— Select Cutting Plan —</option>
                  <option *ngFor="let cp of pendingPlans" [value]="cp.cutting_plan_id || cp.id">
                    {{ cp.cutting_plan_id || ('#' + cp.id) }}
                    {{ cp.style_no ? ' · Style: ' + cp.style_no : '' }}
                    {{ cp.planned_pieces ? ' · Target: ' + cp.planned_pieces + ' pcs' : '' }}
                    {{ cp.cutting_master ? ' · Master: ' + cp.cutting_master : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Cutting Plan selection is required.</div>
              </div>

            </div>

            <!-- ── Selected Plan Info Card ──────────────────────────── -->
            <div *ngIf="selectedPlan" class="alert py-3 mb-4"
                 style="background:#eef4ff; border:1px solid #c7d8f8; border-radius:10px;">
              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Plan ID</div>
                  <div class="fw-bold text-primary" style="font-size:0.95rem;">
                    {{ selectedPlan.cutting_plan_id || selectedPlan.id }}
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Target</div>
                  <div class="fw-bold" style="font-size:0.95rem;">
                    {{ selectedPlan.planned_pieces | number }} pcs
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Cut So Far</div>
                  <div class="fw-bold text-success" style="font-size:0.95rem;">
                    {{ previousCutTotal | number }} pcs
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted" style="font-size:0.72rem; text-transform:uppercase; font-weight:600;">Remaining</div>
                  <div class="fw-bold" [ngClass]="planRemaining > 0 ? 'text-warning' : 'text-success'"
                       style="font-size:0.95rem;">
                    {{ planRemaining | number }} pcs
                  </div>
                </div>
              </div>
              <!-- Mini progress bar -->
              <div class="mt-3">
                <div class="d-flex justify-content-between small text-muted mb-1">
                  <span>Overall Progress</span>
                  <span>{{ planProgressPct }}%</span>
                </div>
                <div class="progress" style="height:8px; border-radius:6px;">
                  <div class="progress-bar"
                       [ngClass]="planProgressPct >= 100 ? 'bg-success' : planProgressPct >= 60 ? 'bg-primary' : 'bg-warning'"
                       role="progressbar"
                       [style.width.%]="planProgressPct"
                       aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Section 2: Today's Production ──────────────────── -->
            <div class="section-label">
              <i class="bi bi-scissors me-1"></i>Today's Production Entry
            </div>
            <div class="row g-3 mb-4">

              <!-- Today's Actual Cut Pieces -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Today's Actual Cut Pieces <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text"><i class="bi bi-scissors"></i></span>
                  <input type="number" class="form-control" formControlName="actual_cut_pieces"
                         min="0" placeholder="e.g. 2000"
                         [class.is-invalid]="isInvalid('actual_cut_pieces')">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <div class="invalid-feedback d-block"
                     *ngIf="isInvalid('actual_cut_pieces')">
                  Actual Cut Pieces is required.
                </div>
                <!-- Running total preview -->
                <div *ngIf="form.get('actual_cut_pieces')?.value > 0 && selectedPlan" class="mt-1">
                  <small class="text-muted">
                    Running total after today:
                    <span class="fw-bold"
                          [ngClass]="runningTotal >= selectedPlan?.planned_pieces ? 'text-success' : 'text-primary'">
                      {{ runningTotal | number }} pcs
                    </span>
                    <span *ngIf="runningTotal >= selectedPlan?.planned_pieces"
                          class="badge bg-success ms-1 small">
                      <i class="bi bi-check-circle me-1"></i>Plan will be COMPLETED!
                    </span>
                  </small>
                </div>
              </div>

              <!-- Today's Reject Pieces -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Today's Reject Pieces</label>
                <div class="input-group">
                  <span class="input-group-text text-danger"><i class="bi bi-x-circle"></i></span>
                  <input type="number" class="form-control" formControlName="reject_pieces"
                         min="0" placeholder="e.g. 0">
                  <span class="input-group-text text-muted small">pcs</span>
                </div>
                <small class="text-muted">Pieces rejected due to defects during cutting</small>
              </div>

            </div>

            <!-- Info alert about auto-status logic -->
            <div class="alert alert-warning d-flex align-items-start gap-2 py-2 mb-4"
                 style="border-radius:8px; font-size:0.85rem;">
              <i class="bi bi-lightning-fill text-warning mt-1"></i>
              <div>
                <strong>Auto Logic on Save:</strong>
                When <em>Previous Cut + Today's Cut ≥ Planned Pieces</em>, the plan status
                automatically changes from
                <span class="badge bg-warning text-dark">Pending</span> to
                <span class="badge bg-success">Completed</span>, and it becomes
                available in the Sewing module.
              </div>
            </div>

            <!-- ── Actions ──────────────────────────────────────────── -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-5" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  {{ submitting ? 'Saving...' : 'Save Production' }}
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
export class AddDayWiseCuttingProductionComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  /** Only non-completed cutting plans shown in dropdown */
  pendingPlans:     any[] = [];
  allDailyRecords:  any[] = [];

  selectedPlan:    any    = null;
  previousCutTotal        = 0;   // sum of daily entries BEFORE today
  planProgressPct         = 0;
  planRemaining           = 0;
  submitting              = false;

  form: FormGroup = this.fb.group({
    date:              [new Date().toISOString().substring(0, 10), Validators.required],
    cutting_plan_id:   ['', Validators.required],
    actual_cut_pieces: [null, [Validators.required, Validators.min(0)]],
    reject_pieces:     [0,   [Validators.min(0)]]
  });

  get runningTotal(): number {
    return this.previousCutTotal + (Number(this.form.get('actual_cut_pieces')?.value) || 0);
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans:  this.svc.getCuttingPlans(),
      daily:  this.svc.getDayWiseCuttingProduction()
    }).subscribe(({ plans, daily }) => {
      // Only show Pending (not Completed) plans in dropdown
      this.pendingPlans    = plans.filter((p: any) => p.status !== 'Completed');
      this.allDailyRecords = daily;
    });
  }

  onPlanChange(event: any) {
    const planKey = event.target.value;
    this.selectedPlan = this.pendingPlans.find(
      p => (p.cutting_plan_id || p.id) === planKey
    ) || null;

    if (this.selectedPlan) {
      // Sum all previous daily entries for this plan
      const planId = this.selectedPlan.cutting_plan_id || this.selectedPlan.id;
      const prev = this.allDailyRecords.filter(
        r => (r.cutting_plan_id || r.plan_id) === planId
      );
      this.previousCutTotal = prev.reduce((sum: number, r: any) => sum + (Number(r.actual_cut_pieces) || 0), 0);
      this.recalcProgress();
    } else {
      this.previousCutTotal = 0;
      this.planProgressPct  = 0;
      this.planRemaining    = 0;
    }
  }

  recalcProgress() {
    if (!this.selectedPlan) return;
    const target    = Number(this.selectedPlan.planned_pieces) || 1;
    this.planRemaining   = Math.max(0, target - this.previousCutTotal);
    this.planProgressPct = Math.min(100, Math.round((this.previousCutTotal / target) * 100));
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      date:          new Date().toISOString().substring(0, 10),
      reject_pieces: 0
    });
    this.selectedPlan     = null;
    this.previousCutTotal = 0;
    this.planProgressPct  = 0;
    this.planRemaining    = 0;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const val     = this.form.value;
    const planKey = val.cutting_plan_id;

    // Sum check: previous + today
    const todayCut    = Number(val.actual_cut_pieces) || 0;
    const totalActual = this.previousCutTotal + todayCut;
    const target      = Number(this.selectedPlan?.planned_pieces) || 0;
    const willComplete = target > 0 && totalActual >= target;

    // 1. Save daily production record
    const dailyRecord = {
      cutting_plan_id:   planKey,
      plan_id:           planKey,
      date:              val.date,
      actual_cut_pieces: todayCut,
      reject_pieces:     Number(val.reject_pieces) || 0,
      style_no:          this.selectedPlan?.style_no || '',
      order_id:          this.selectedPlan?.order_id || '',
      cutting_master:    this.selectedPlan?.cutting_master || ''
    };

    this.svc.createDayWiseCuttingProduction(dailyRecord).subscribe({
      next: () => {
        // 2. If total cut >= planned pieces → update plan status to Completed
        if (willComplete && this.selectedPlan) {
          const planDbId = this.selectedPlan.id;
          const updatedPlan = { ...this.selectedPlan, status: 'Completed' };
          this.svc.updateCuttingPlan(planDbId, updatedPlan).subscribe({
            next: () => {
              this.notify.success(
                `🎉 Production saved! Plan ${planKey} is now COMPLETED — it's unlocked for Sewing.`
              );
            },
            error: () => {
              this.notify.success('Daily production saved. (Status update pending — please refresh.)');
            }
          });
        } else {
          this.notify.success(
            `Daily cutting production saved. Total cut so far: ${totalActual} / ${target} pcs`
          );
        }

        this.resetForm();
        this.loadData();
        this.submitting = false;
      },
      error: () => {
        this.notify.error('Failed to save daily cutting production.');
        this.submitting = false;
      }
    });
  }
}
