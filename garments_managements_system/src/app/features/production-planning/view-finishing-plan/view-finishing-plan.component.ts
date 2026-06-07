import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-finishing-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Title Card -->
      <div class="card shadow-sm border-0 mb-4" style="border-radius:12px; overflow:hidden;">
        <div class="card-header border-0 py-3 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:40px;height:40px;background:rgba(255,255,255,0.15);">
                <i class="bi bi-grid-3x3-gap-fill text-white fs-5"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Finishing Plans</h5>
                <small class="text-white-50">Overview of all active and completed finishing schedules and real-time progress</small>
              </div>
            </div>
            <button class="btn btn-sm btn-light text-primary fw-semibold px-3" (click)="loadData()">
              <i class="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>
      
      <!-- Content Grid -->
      <div class="row g-4">
        <!-- Empty State -->
        <div class="col-12 text-center py-5 text-muted" *ngIf="plans.length === 0">
          <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
          <h5 class="fw-bold">No Finishing Plans Found</h5>
          <p class="mb-0">Create a finishing plan to see real-time statistics here.</p>
        </div>

        <!-- Finishing Plan Cards -->
        <div class="col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card h-100 shadow-sm border-0 plan-card" style="border-radius:12px; border-top: 4px solid #7c3aed !important;">
            <!-- Header -->
            <div class="card-header border-0 bg-white d-flex justify-content-between align-items-center pt-3 pb-2">
              <div>
                <h6 class="mb-0 text-primary fw-bold" style="letter-spacing:-0.3px;">
                  <i class="bi bi-bookmark-star-fill me-2 text-warning"></i>{{ p.finishing_plan_id || 'FP-#' + p.id }}
                </h6>
                <small class="text-muted" style="font-size:0.75rem;">Sewing Ref: {{ p.sewing_plan_id || 'N/A' }}</small>
              </div>
              <span class="badge px-3 py-2 rounded-pill" [ngClass]="{
                'bg-warning-subtle text-warning-emphasis border border-warning-subtle': p.status === 'In Finishing', 
                'bg-success-subtle text-success-emphasis border border-success-subtle': p.status === 'Completed',
                'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle': p.status !== 'In Finishing' && p.status !== 'Completed'
              }">
                {{ p.status }}
              </span>
            </div>
            
            <!-- Body -->
            <div class="card-body pt-2 pb-3">
              <!-- Buyer / Style Info -->
              <div class="mb-3 p-3 bg-light rounded-3" style="font-size:0.85rem;">
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Buyer Name</span>
                    <span class="fw-semibold text-dark">{{ p.buyer_name || 'N/A' }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Style / Order</span>
                    <span class="fw-semibold text-dark">{{ p.style_no || 'N/A' }} <small class="text-muted">({{ p.order_no || 'N/A' }})</small></span>
                  </div>
                  <div class="col-6 mt-2">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Color</span>
                    <span class="fw-semibold text-dark">{{ p.color || 'N/A' }}</span>
                  </div>
                  <div class="col-6 mt-2">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Table & Supervisor</span>
                    <span class="fw-semibold text-dark">{{ p.finishing_table_no || 'N/A' }} <small class="text-muted">/ {{ p.supervisor_name || 'N/A' }}</small></span>
                  </div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="mb-3 px-3 py-2 bg-light rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <i class="bi bi-calendar-check text-muted me-2"></i>
                  <span style="font-size: 0.8rem;" class="fw-medium">{{ p.start_date | date:'mediumDate' }}</span>
                </div>
                <i class="bi bi-arrow-right text-muted mx-2"></i>
                <div class="d-flex align-items-center">
                  <span style="font-size: 0.8rem;" class="fw-medium">{{ p.end_date | date:'mediumDate' }}</span>
                </div>
              </div>

              <!-- Process Requirements -->
              <div class="mb-3">
                <span class="text-muted d-block mb-2 fw-semibold" style="font-size:0.75rem;">PROCESS REQUIREMENTS</span>
                <div class="d-flex flex-wrap gap-2">
                  <span class="badge px-2 py-1 rounded" [ngClass]="p.proc_trimming ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-muted border'">
                    <i class="bi bi-scissors me-1"></i>Trimming
                  </span>
                  <span class="badge px-2 py-1 rounded" [ngClass]="p.proc_ironing ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-light text-muted border'">
                    <i class="bi bi-thermometer-sun me-1"></i>Ironing
                  </span>
                  <span class="badge px-2 py-1 rounded" [ngClass]="p.proc_washing ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-light text-muted border'">
                    <i class="bi bi-droplet me-1"></i>Washing
                  </span>
                  <span class="badge px-2 py-1 rounded" [ngClass]="p.proc_button_attach ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-light text-muted border'">
                    <i class="bi bi-circle-half me-1"></i>Button
                  </span>
                </div>
              </div>

              <!-- Live Production Sums -->
              <div class="row g-2 text-center p-2 rounded border mb-3" style="background: #fafafa;">
                <div class="col-4 border-end">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Target Qty</span>
                  <span class="fw-bold fs-6 text-dark">{{ p.target_qty || 0 }}</span>
                </div>
                <div class="col-4 border-end">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Total Passed</span>
                  <span class="fw-bold fs-6 text-success"><i class="bi bi-check-circle me-1"></i>{{ p.pass_qty || 0 }}</span>
                </div>
                <div class="col-4">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Total Rejected</span>
                  <span class="fw-bold fs-6 text-danger"><i class="bi bi-x-circle me-1"></i>{{ p.rejection_qty || 0 }}</span>
                </div>
              </div>

              <!-- Overall Progress / Efficiency -->
              <div>
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="text-muted fw-semibold" style="font-size: 0.75rem;">Finishing Progress</span>
                  <span class="fw-bold" style="font-size: 0.85rem;" [ngClass]="{
                    'text-success': getCompletion(p) >= 100,
                    'text-primary': getCompletion(p) >= 50 && getCompletion(p) < 100,
                    'text-warning': getCompletion(p) < 50
                  }">{{ getCompletion(p) }}%</span>
                </div>
                <div class="progress" style="height: 8px; border-radius: 4px;">
                  <div class="progress-bar" 
                       [ngClass]="{
                         'bg-success': getCompletion(p) >= 100,
                         'bg-primary': getCompletion(p) >= 50 && getCompletion(p) < 100,
                         'bg-warning': getCompletion(p) < 50
                       }" 
                       role="progressbar" 
                       [style.width.%]="getCompletion(p)" 
                       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card {
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.75rem 1.5rem rgba(124, 58, 237, 0.12) !important;
    }
  `]
})
export class ViewFinishingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);

  plans: any[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans: this.svc.getFinishingPlans(),
      dailyProd: this.svc.getDayWiseFinishingProduction()
    }).subscribe({
      next: ({ plans, dailyProd }) => {
        this.plans = plans.map((plan: any) => {
          const matchingLogs = dailyProd.filter((d: any) => 
            (d.finishing_plan_id === plan.finishing_plan_id || d.plan_id === plan.finishing_plan_id)
          );
          
          const totalPass = matchingLogs.reduce((sum, log) => sum + (Number(log.pass_qty) || 0), 0);
          const totalReject = matchingLogs.reduce((sum, log) => sum + (Number(log.reject_qty) || 0), 0);

          return {
            ...plan,
            pass_qty: totalPass,
            rejection_qty: totalReject
          };
        });
      }
    });
  }

  getCompletion(plan: any): number {
    const target = Number(plan.target_qty) || 1;
    const actual = Number(plan.pass_qty) || 0;
    const eff = Math.round((actual / target) * 100);
    return eff > 100 ? 100 : eff;
  }
}
