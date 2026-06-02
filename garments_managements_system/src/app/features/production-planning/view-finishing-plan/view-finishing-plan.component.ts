import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-finishing-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-grid me-2"></i>Finishing Plans</h5>
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-12 text-center py-5 text-muted" *ngIf="plans.length === 0">
          <i class="bi bi-inbox fs-1 d-block mb-3"></i>
          <h5>No Finishing Plans Found</h5>
          <p>Create a new finishing plan to see it here.</p>
        </div>

        <div class="col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card h-100 shadow-sm border-0 plan-card">
            <!-- Header -->
            <div class="card-header border-0 bg-white d-flex justify-content-between align-items-center pt-3 pb-2">
              <h6 class="mb-0 text-primary fw-bold">
                <i class="bi bi-bookmark-star-fill me-2"></i>{{ p.finishing_plan_id || 'FP-#' + p.id }}
              </h6>
              <span class="badge" [ngClass]="{
                'bg-warning text-dark': p.status === 'Pending', 
                'bg-primary': p.status === 'Running', 
                'bg-success': p.status === 'Done' || p.status === 'Completed'
              }">
                {{ p.status }}
              </span>
            </div>
            
            <!-- Body -->
            <div class="card-body pt-2 pb-3">
              <!-- Info Grid -->
              <div class="row g-2 mb-3 text-sm">
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Order ID</div>
                  <div class="fw-semibold">{{ p.order_id || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Style No</div>
                  <div class="fw-semibold">{{ p.style_no || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Sewing Plan</div>
                  <div class="fw-semibold text-truncate" title="{{ p.sewing_plan_id }}">{{ p.sewing_plan_id || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Assigned To</div>
                  <div class="fw-semibold text-truncate" title="{{ p.assigned_to }}">{{ p.assigned_to || 'Unassigned' }}</div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="mb-3 px-3 py-2 bg-light rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <i class="bi bi-calendar-check text-muted me-2"></i>
                  <span style="font-size: 0.85rem;" class="fw-medium">{{ p.start_date | date:'mediumDate' }}</span>
                </div>
                <i class="bi bi-arrow-right text-muted mx-2"></i>
                <div class="d-flex align-items-center">
                  <span style="font-size: 0.85rem;" class="fw-medium">{{ p.end_date | date:'mediumDate' }}</span>
                </div>
              </div>

              <!-- Finishing Specs -->
              <div class="mb-3 border rounded p-2 text-center" style="font-size: 0.8rem;">
                <div class="row g-0 align-items-center">
                  <div class="col-6 border-end">
                    <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Ironing Type</span>
                    <span class="fw-semibold">{{ p.ironing_type || 'N/A' }}</span>
                  </div>
                  <div class="col-6 px-2">
                    <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">QC Result</span>
                    <select class="form-select form-select-sm mx-auto" [(ngModel)]="p.quality_check" style="font-size: 0.75rem; padding: 2px 10px; width: 90%;">
                      <option value="QC Pass">QC Pass</option>
                      <option value="QC Fail">QC Fail</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Process Toggles -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                 <span class="badge" [ngClass]="p.thread_cutting ? 'bg-info text-dark' : 'bg-light text-muted border'">Thread Cut</span>
                 <span class="badge" [ngClass]="p.button_attach ? 'bg-info text-dark' : 'bg-light text-muted border'">Button</span>
                 <span class="badge" [ngClass]="p.label_attach ? 'bg-info text-dark' : 'bg-light text-muted border'">Label</span>
              </div>
              
              <!-- Editable Quantities -->
              <div class="row g-2 align-items-center mb-1">
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Input Qty</label>
                  <div class="fw-bold fs-6">{{ p.input_qty || 0 }}</div>
                </div>
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Target Qty</label>
                  <div class="fw-bold fs-6">{{ p.target_qty || 0 }}</div>
                </div>
              </div>

              <div class="row g-2 mt-2">
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Pass Qty</label>
                  <input type="number" class="form-control form-control-sm text-success fw-bold" [(ngModel)]="p.pass_qty" min="0">
                </div>
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Rejection Qty</label>
                  <input type="number" class="form-control form-control-sm text-danger fw-bold" [(ngModel)]="p.rejection_qty" min="0">
                </div>
              </div>

              <!-- Overall Progress / Efficiency -->
              <div class="mt-3">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="text-muted" style="font-size: 0.75rem;">Finishing Progress</span>
                  <span class="fw-bold" style="font-size: 0.85rem;" [ngClass]="{
                    'text-success': getCompletion(p) >= 80,
                    'text-warning': getCompletion(p) >= 50 && getCompletion(p) < 80,
                    'text-danger': getCompletion(p) < 50
                  }">{{ getCompletion(p) }}%</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [ngClass]="{
                         'bg-success': getCompletion(p) >= 80,
                         'bg-warning': getCompletion(p) >= 50 && getCompletion(p) < 80,
                         'bg-danger': getCompletion(p) < 50
                       }" 
                       role="progressbar" 
                       [style.width.%]="getCompletion(p)" 
                       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

            </div>
            
            <!-- Card Footer -->
            <div class="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <label class="text-muted small mb-0">Status:</label>
                <select class="form-select form-select-sm" style="width: 100px" [(ngModel)]="p.status">
                  <option value="Pending">Pending</option>
                  <option value="Running">Running</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <button class="btn btn-sm btn-primary px-3 shadow-sm" (click)="savePlan(p)">
                <i class="bi bi-save me-1"></i> Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
    }
  `]
})
export class ViewFinishingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  plans: any[] = [];

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.svc.getFinishingPlans().subscribe(data => {
      this.plans = data;
    });
  }

  getCompletion(plan: any): number {
    const target = Number(plan.target_qty) || 1;
    const actual = Number(plan.pass_qty) || 0;
    const eff = Math.round((actual / target) * 100);
    return eff > 100 ? 100 : eff;
  }

  savePlan(plan: any) {
    this.svc.updateFinishingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Finishing Plan updated successfully');
      this.loadPlans();
    });
  }
}
