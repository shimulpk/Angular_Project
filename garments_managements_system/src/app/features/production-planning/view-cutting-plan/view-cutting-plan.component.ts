import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-cutting-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">

      <!-- ── Page Header ──────────────────────────────────────────── -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:12px; overflow:hidden;">
        <div class="card-body py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
                <i class="bi bi-scissors fs-4 text-white"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Cutting Plans</h5>
                <small class="text-white-50">Monitor progress for all cutting plans</small>
              </div>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <span class="badge px-3 py-2 fw-semibold" style="background:rgba(255,255,255,0.2); font-size:0.82rem; border-radius:20px;">
                <i class="bi bi-list me-1"></i>{{ plans.length }} Total
              </span>
              <span class="badge px-3 py-2 fw-semibold" style="background:rgba(255,193,7,0.3); color:#fff; font-size:0.82rem; border-radius:20px;">
                <i class="bi bi-hourglass-split me-1"></i>{{ countByStatus('Pending') }} Pending
              </span>
              <span class="badge px-3 py-2 fw-semibold" style="background:rgba(40,167,69,0.35); color:#fff; font-size:0.82rem; border-radius:20px;">
                <i class="bi bi-check-circle me-1"></i>{{ countByStatus('Completed') }} Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Loading ──────────────────────────────────────────────── -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3">Loading cutting plans...</p>
      </div>

      <!-- ── Empty State ───────────────────────────────────────────── -->
      <div *ngIf="!loading && plans.length === 0"
           class="card border-0 shadow-sm text-center py-5" style="border-radius:12px;">
        <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
        <h5 class="text-muted">No Cutting Plans Found</h5>
        <p class="text-muted small mb-0">Use <strong>Add Cutting Plan</strong> to create the first plan.</p>
      </div>

      <!-- ── Plan Cards Grid ──────────────────────────────────────── -->
      <div *ngIf="!loading && plans.length > 0" class="row g-4">
        <div class="col-12 col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card border-0 shadow-sm h-100 plan-card" style="border-radius:14px; overflow:hidden;">

            <!-- Card Top Stripe (colour by status) -->
            <div class="px-4 pt-3 pb-2 d-flex align-items-start justify-content-between"
                 [ngStyle]="{ background: statusGradient(p.status) }">
              <div>
                <div class="fw-bold text-white" style="font-size:0.98rem;">
                  {{ p.cutting_plan_id || ('#' + p.id) }}
                </div>
                <div class="text-white-50 small mt-1">
                  <i class="bi bi-tag me-1"></i>{{ p.style_no || '—' }}
                </div>
              </div>
              <span class="badge fw-semibold mt-1"
                    [ngClass]="statusBadge(p.status)"
                    style="font-size:0.75rem; padding:5px 10px; border-radius:20px;">
                <i class="bi me-1" [ngClass]="statusIcon(p.status)"></i>
                {{ p.status }}
              </span>
            </div>

            <div class="card-body px-4 pt-3 pb-2">

              <!-- Info Grid -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-person-badge me-1"></i>Buyer</div>
                    <div class="info-chip-value">{{ getBuyerName(p.buyer_id) }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-file-earmark-text me-1"></i>Order / PO</div>
                    <div class="info-chip-value">{{ p.order_id || '—' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-layers me-1"></i>Fabric Type</div>
                    <div class="info-chip-value">{{ p.fabric_type || '—' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-palette me-1"></i>Color</div>
                    <div class="info-chip-value">{{ p.color || '—' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-person-gear me-1"></i>Cutting Master</div>
                    <div class="info-chip-value">{{ p.cutting_master || p.assigned_to || '—' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-grid-1x2 me-1"></i>Table No.</div>
                    <div class="info-chip-value">{{ p.cutting_table_number || '—' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-calendar-event me-1"></i>Start Date</div>
                    <div class="info-chip-value">{{ (p.start_date || p.cutting_date) | date:'dd MMM yy' }}</div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="info-chip">
                    <div class="info-chip-label"><i class="bi bi-calendar-check me-1"></i>End Date</div>
                    <div class="info-chip-value">{{ p.end_date | date:'dd MMM yy' }}</div>
                  </div>
                </div>
              </div>

              <hr class="my-2">

              <!-- ── Three Quantity Boxes ── -->
              <div class="row g-2 text-center mb-3">
                <div class="col-4">
                  <div class="qty-box qty-box--target">
                    <div class="qty-box-label">Target</div>
                    <div class="qty-box-value">{{ p.planned_pieces | number }}</div>
                    <div class="qty-box-unit">pcs</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="qty-box qty-box--actual">
                    <div class="qty-box-label">Actual Cut</div>
                    <div class="qty-box-value">{{ getActualCut(p) | number }}</div>
                    <div class="qty-box-unit">pcs</div>
                  </div>
                </div>
                <div class="col-4">
                  <div class="qty-box qty-box--reject">
                    <div class="qty-box-label">Rejected</div>
                    <div class="qty-box-value">{{ getTotalRejected(p) | number }}</div>
                    <div class="qty-box-unit">pcs</div>
                  </div>
                </div>
              </div>

              <!-- ── Progress Bar ── -->
              <div class="mb-2">
                <div class="d-flex justify-content-between small fw-semibold mb-1">
                  <span class="text-muted">Progress</span>
                  <span [ngClass]="progressColor(getProgress(p))">{{ getProgress(p) }}%</span>
                </div>
                <div class="progress" style="height:10px; border-radius:8px;">
                  <div class="progress-bar"
                       [ngClass]="progressBarClass(getProgress(p))"
                       role="progressbar"
                       [style.width.%]="getProgress(p)"
                       aria-valuemin="0" aria-valuemax="100">
                  </div>
                </div>
                <div *ngIf="getProgress(p) >= 100"
                     class="text-center mt-1">
                  <small class="text-success fw-bold">
                    <i class="bi bi-check-circle-fill me-1"></i>Cutting Complete
                  </small>
                </div>
              </div>

            </div>

            <!-- Card Footer – extra details -->
            <div class="card-footer bg-light border-0 px-4 py-2">
              <div class="row g-1 text-muted" style="font-size:0.75rem;">
                <div class="col-auto" *ngIf="p.fabric_type">
                  <i class="bi bi-layers me-1"></i>{{ p.fabric_type }}
                </div>
                <div class="col-auto" *ngIf="p.marker_efficiency">
                  <span class="mx-1">·</span>
                  <i class="bi bi-speedometer2 me-1"></i>ME: {{ p.marker_efficiency }}%
                </div>
                <div class="col-auto" *ngIf="p.number_of_plies">
                  <span class="mx-1">·</span>
                  <i class="bi bi-stack me-1"></i>Plies: {{ p.number_of_plies }}
                </div>
                <div class="col-auto" *ngIf="p.total_fabric_required">
                  <span class="mx-1">·</span>
                  <i class="bi bi-rulers me-1"></i>Fabric: {{ p.total_fabric_required }} yds
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Refresh button -->
      <div class="text-center mt-4" *ngIf="!loading && plans.length > 0">
        <button class="btn btn-outline-primary btn-sm px-4" (click)="loadData()">
          <i class="bi bi-arrow-clockwise me-1"></i>Refresh Plans
        </button>
      </div>

    </div>
  `,
  styles: [`
    .plan-card {
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .plan-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(37,99,235,0.14) !important;
    }

    /* Info chip */
    .info-chip { padding: 4px 0; }
    .info-chip-label {
      font-size: 0.68rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #94a3b8;
    }
    .info-chip-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Quantity boxes */
    .qty-box {
      border-radius: 10px;
      padding: 10px 6px;
    }
    .qty-box-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 2px;
    }
    .qty-box-value {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1.2;
    }
    .qty-box-unit {
      font-size: 0.65rem;
      font-weight: 500;
      opacity: 0.7;
    }

    .qty-box--target {
      background: #eff6ff;
      color: #1d4ed8;
    }
    .qty-box--actual {
      background: #f0fdf4;
      color: #15803d;
    }
    .qty-box--reject {
      background: #fff5f5;
      color: #dc2626;
    }
  `]
})
export class ViewCuttingPlanComponent implements OnInit {
  private svc      = inject(ProductionPlanningService);
  private buyerSvc = inject(BuyerService);
  private notify   = inject(NotificationService);

  plans:       any[] = [];
  buyers:      any[] = [];
  dailyRecords: any[] = [];
  loading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      plans:  this.svc.getCuttingPlans(),
      daily:  this.svc.getDayWiseCuttingProduction(),
      buyers: this.buyerSvc.getBuyers()
    }).subscribe({
      next: ({ plans, daily, buyers }) => {
        // Sort: Pending first, then Completed
        this.plans = plans.sort((a: any, b: any) => {
          const order = ['Pending', 'Completed'];
          return order.indexOf(a.status) - order.indexOf(b.status);
        });
        this.dailyRecords = daily;
        this.buyers       = buyers;
        this.loading      = false;
      },
      error: () => { this.loading = false; }
    });
  }

  /** Sum of actual_cut_pieces from daily records for this plan */
  getActualCut(plan: any): number {
    const planKey = plan.cutting_plan_id || plan.id;
    return this.dailyRecords
      .filter(r => (r.cutting_plan_id || r.plan_id) === planKey)
      .reduce((sum, r) => sum + (Number(r.actual_cut_pieces) || 0), 0);
  }

  /** Sum of reject_pieces from daily records for this plan */
  getTotalRejected(plan: any): number {
    const planKey = plan.cutting_plan_id || plan.id;
    return this.dailyRecords
      .filter(r => (r.cutting_plan_id || r.plan_id) === planKey)
      .reduce((sum, r) => sum + (Number(r.reject_pieces) || 0), 0);
  }

  /** (Actual Cut / Planned Pieces) × 100 */
  getProgress(plan: any): number {
    const target = Number(plan.planned_pieces) || 1;
    const actual = this.getActualCut(plan);
    return Math.min(100, Math.round((actual / target) * 100));
  }

  getBuyerName(buyerId: string): string {
    const b = this.buyers.find(x => x.id === buyerId);
    return b ? b.companyName : (buyerId || '—');
  }

  countByStatus(status: string): number {
    return this.plans.filter(p => p.status === status).length;
  }

  statusGradient(status: string): string {
    switch (status) {
      case 'Completed': return 'linear-gradient(135deg,#064e3b,#059669)';
      default:          return 'linear-gradient(135deg,#1e3a5f,#2563eb)';
    }
  }

  statusBadge(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-success';
      default:          return 'bg-warning text-dark';
    }
  }

  statusIcon(status: string): string {
    switch (status) {
      case 'Completed': return 'bi-check-circle-fill';
      default:          return 'bi-hourglass-split';
    }
  }

  progressColor(pct: number): string {
    if (pct >= 100) return 'text-success';
    if (pct >= 60)  return 'text-primary';
    return 'text-warning';
  }

  progressBarClass(pct: number): string {
    if (pct >= 100) return 'bg-success';
    if (pct >= 60)  return 'bg-primary';
    return 'bg-warning';
  }
}
