import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-sewing-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-grid me-2"></i>Sewing Plans</h5>
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-12 text-center py-5 text-muted" *ngIf="plans.length === 0">
          <i class="bi bi-inbox fs-1 d-block mb-3"></i>
          <h5>No Sewing Plans Found</h5>
          <p>Create a new sewing plan to see it here.</p>
        </div>

        <div class="col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card h-100 shadow-sm border-0 plan-card">
            <!-- Card Header -->
            <div class="card-header border-0 bg-white d-flex justify-content-between align-items-center pt-3 pb-2">
              <h6 class="mb-0 text-primary fw-bold">
                <i class="bi bi-diagram-3-fill me-2"></i>{{ p.sewing_plan_id || 'SP-#' + p.id }}
              </h6>
              <span class="badge" [ngClass]="{
                'bg-warning text-dark': p.status === 'Pending', 
                'bg-primary': p.status === 'Running', 
                'bg-success': p.status === 'Completed'
              }">
                {{ p.status }}
              </span>
            </div>
            
            <!-- Card Body -->
            <div class="card-body pt-2 pb-3">
              <!-- Info grid -->
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
                  <div class="text-muted" style="font-size: 0.75rem;">Cutting Plan</div>
                  <div class="fw-semibold text-truncate" title="{{ p.cutting_plan_id }}">{{ p.cutting_plan_id || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Supervisor</div>
                  <div class="fw-semibold text-truncate" title="{{ p.assigned_supervisor }}">{{ p.assigned_supervisor || 'Unassigned' }}</div>
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

              <!-- Targets Table inside Card -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="fs-6 mb-0 text-muted"><i class="bi bi-list-ol me-1"></i>Line Allocations</h6>
                <span class="badge bg-light text-dark border">{{ p.targets?.length || 0 }} Lines</span>
              </div>
              
              <div class="table-responsive mb-3 border rounded">
                <table class="table table-sm table-borderless align-middle mb-0 text-center" style="font-size: 0.8rem;">
                  <thead class="table-light border-bottom">
                    <tr>
                      <th class="text-start ps-2">Line</th>
                      <th>Target</th>
                      <th>Achieved</th>
                      <th class="pe-2">Reject</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let t of p.targets" class="border-bottom">
                      <td class="fw-semibold text-start ps-2">{{ t.line_no }}</td>
                      <td>{{ t.target_quantity }}</td>
                      <td class="text-success fw-bold">{{ t.achieved_quantity || 0 }}</td>
                      <td class="text-danger pe-2">{{ t.rejection_qty || 0 }}</td>
                    </tr>
                    <tr *ngIf="!p.targets || p.targets.length === 0">
                      <td colspan="4" class="text-muted py-2">No lines allocated</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Overall Progress / Efficiency -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="text-muted" style="font-size: 0.75rem;">Overall Completion</span>
                  <span class="fw-bold" style="font-size: 0.85rem;" [ngClass]="{
                    'text-success': getEfficiencyValue(p) >= 80,
                    'text-warning': getEfficiencyValue(p) >= 50 && getEfficiencyValue(p) < 80,
                    'text-danger': getEfficiencyValue(p) < 50
                  }">{{ getEfficiencyValue(p) }}%</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [ngClass]="{
                         'bg-success': getEfficiencyValue(p) >= 80,
                         'bg-warning': getEfficiencyValue(p) >= 50 && getEfficiencyValue(p) < 80,
                         'bg-danger': getEfficiencyValue(p) < 50
                       }" 
                       role="progressbar" 
                       [style.width.%]="getEfficiencyValue(p)" 
                       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

              <!-- Aggregated metrics -->
              <div class="row g-2 text-center pt-2">
                <div class="col-4">
                  <div class="p-2 bg-light rounded">
                    <div class="text-muted" style="font-size: 0.7rem; text-transform: uppercase;">Input</div>
                    <div class="fw-bold">{{ p.input_received_qty || 0 }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2 bg-light rounded border border-primary border-opacity-25">
                    <div class="text-primary" style="font-size: 0.7rem; text-transform: uppercase;">Output</div>
                    <div class="fw-bold text-primary">{{ p.output_qty || 0 }}</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="p-2 bg-light rounded border border-danger border-opacity-25">
                    <div class="text-danger" style="font-size: 0.7rem; text-transform: uppercase;">Reject</div>
                    <div class="fw-bold text-danger">{{ p.rejection_qty || 0 }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Card Footer -->
            <div class="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <label class="text-muted small mb-0">Status:</label>
                <select class="form-select form-select-sm" style="width: 120px" [(ngModel)]="p.status">
                  <option value="Pending">Pending</option>
                  <option value="Running">Running</option>
                  <option value="Completed">Completed</option>
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
    .table-sm th, .table-sm td {
      padding: 0.4rem;
    }
  `]
})
export class ViewSewingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  plans: any[] = [];

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.svc.getSewingPlans().subscribe(data => {
      this.plans = data;
    });
  }

  getEfficiencyValue(plan: any): number {
    const totalTarget = plan.targets?.reduce((sum: number, t: any) => sum + (Number(t.target_quantity) || 0), 0) || 0;
    const actual = plan.output_qty || 0;
    if (!totalTarget) return 0;
    const eff = Math.round((actual / totalTarget) * 100);
    return eff > 100 ? 100 : eff;
  }

  savePlan(plan: any) {
    this.svc.updateSewingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Sewing Plan updated successfully');
      this.loadPlans();
    });
  }
}
