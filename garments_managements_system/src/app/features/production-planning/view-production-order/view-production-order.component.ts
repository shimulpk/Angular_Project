import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-production-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4 po-wrapper">

      <!-- Page Header -->
      <div class="po-page-header mb-4">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h4 class="po-page-title mb-1">
              <span class="po-icon-wrap me-2"><i class="bi bi-kanban-fill"></i></span>
              Production Orders
            </h4>
            <p class="po-page-sub mb-0">{{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }} found</p>
          </div>
          <div class="po-summary-pill">
            <i class="bi bi-layers-fill me-2"></i>
            Total Plan Qty: <strong class="ms-1">{{ totalPlanQty | number }}</strong>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="orders.length === 0" class="po-empty-state text-center py-5">
        <div class="po-empty-icon mb-3">
          <i class="bi bi-inbox"></i>
        </div>
        <h6 class="text-muted">No production orders yet</h6>
        <p class="text-muted small">Add your first production order using the form.</p>
      </div>

      <!-- Cards Grid -->
      <div class="row g-4" *ngIf="orders.length > 0">
        <div class="col-xl-4 col-lg-6 col-md-6" *ngFor="let o of orders; let i = index">
          <div class="po-card h-100">

            <!-- Card Header -->
            <div class="po-card-header">
              <div class="d-flex align-items-start justify-content-between gap-2">
                <div class="flex-grow-1 min-w-0">
                  <div class="po-card-order-id">
                    <i class="bi bi-hash"></i>{{ o.orderId || ('ORD-' + (i + 1)) }}
                  </div>
                  <div class="po-card-style-code">
                    <i class="bi bi-tag-fill me-1"></i>{{ o.styleCode || '—' }}
                  </div>
                </div>
                <span class="po-status-badge po-status-{{ getStatusClass(o.status) }}">
                  <i class="bi {{ getStatusIcon(o.status) }} me-1"></i>{{ o.status || 'Planned' }}
                </span>
              </div>
            </div>

            <!-- Plan Qty Banner -->
            <div class="po-qty-banner">
              <div class="po-qty-item">
                <span class="po-qty-label">Plan Qty</span>
                <span class="po-qty-value">{{ o.planQty | number }}</span>
              </div>
              <div class="po-qty-divider"></div>
              <div class="po-qty-item">
                <span class="po-qty-label"><i class="bi bi-calendar-event me-1"></i>Start</span>
                <span class="po-qty-value po-date-val">{{ (o.startDate | date:'MMM d, y') || '—' }}</span>
              </div>
              <div class="po-qty-divider"></div>
              <div class="po-qty-item">
                <span class="po-qty-label"><i class="bi bi-calendar-check me-1"></i>End</span>
                <span class="po-qty-value po-date-val">{{ (o.endDate | date:'MMM d, y') || '—' }}</span>
              </div>
            </div>

            <!-- Size Breakdown -->
            <div class="po-card-body">

              <!-- Short Sleeve -->
              <div class="po-sleeve-section" *ngIf="hasShortSleeve(o)">
                <div class="po-sleeve-title">
                  <span class="po-sleeve-dot po-dot-short"></span>Short Sleeve
                </div>
                <div class="po-size-grid">
                  <div class="po-size-pill" *ngIf="o.short_S > 0">
                    <span class="po-size-label">S</span>
                    <span class="po-size-qty">{{ o.short_S | number }}</span>
                  </div>
                  <div class="po-size-pill" *ngIf="o.short_M > 0">
                    <span class="po-size-label">M</span>
                    <span class="po-size-qty">{{ o.short_M | number }}</span>
                  </div>
                  <div class="po-size-pill" *ngIf="o.short_L > 0">
                    <span class="po-size-label">L</span>
                    <span class="po-size-qty">{{ o.short_L | number }}</span>
                  </div>
                  <div class="po-size-pill" *ngIf="o.short_XL > 0">
                    <span class="po-size-label">XL</span>
                    <span class="po-size-qty">{{ o.short_XL | number }}</span>
                  </div>
                </div>
              </div>

              <!-- Full Sleeve -->
              <div class="po-sleeve-section" *ngIf="hasFullSleeve(o)">
                <div class="po-sleeve-title">
                  <span class="po-sleeve-dot po-dot-full"></span>Full Sleeve
                </div>
                <div class="po-size-grid">
                  <div class="po-size-pill po-size-pill-full" *ngIf="o.full_S > 0">
                    <span class="po-size-label">S</span>
                    <span class="po-size-qty">{{ o.full_S | number }}</span>
                  </div>
                  <div class="po-size-pill po-size-pill-full" *ngIf="o.full_M > 0">
                    <span class="po-size-label">M</span>
                    <span class="po-size-qty">{{ o.full_M | number }}</span>
                  </div>
                  <div class="po-size-pill po-size-pill-full" *ngIf="o.full_L > 0">
                    <span class="po-size-label">L</span>
                    <span class="po-size-qty">{{ o.full_L | number }}</span>
                  </div>
                  <div class="po-size-pill po-size-pill-full" *ngIf="o.full_XL > 0">
                    <span class="po-size-label">XL</span>
                    <span class="po-size-qty">{{ o.full_XL | number }}</span>
                  </div>
                </div>
              </div>

              <!-- Fallback: legacy size string -->
              <div class="po-sleeve-section" *ngIf="!hasShortSleeve(o) && !hasFullSleeve(o) && o.size">
                <div class="po-sleeve-title">
                  <span class="po-sleeve-dot po-dot-short"></span>Sizes
                </div>
                <div class="po-size-legacy">{{ o.size }}</div>
              </div>

              <!-- Description -->
              <div class="po-description" *ngIf="o.description">
                <i class="bi bi-chat-left-text me-1"></i>{{ o.description }}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --po-accent:       #2563eb;
      --po-short:        #0ea5e9;
      --po-full:         #8b5cf6;
      --po-card-bg:      #ffffff;
      --po-border:       #e5e7eb;
      --po-text:         #111827;
      --po-muted:        #6b7280;
      --po-radius:       14px;
      --po-shadow:       0 2px 12px rgba(0,0,0,0.07);
      --po-shadow-hover: 0 12px 32px rgba(37,99,235,0.15);
    }

    /* ── Page Header ── */
    .po-page-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--po-text);
      display: flex;
      align-items: center;
    }
    .po-icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #1e3a5f, #2563eb);
      color: #fff;
      font-size: 1rem;
    }
    .po-page-sub { color: var(--po-muted); font-size: 0.875rem; }
    .po-summary-pill {
      display: inline-flex;
      align-items: center;
      padding: 8px 20px;
      border-radius: 50px;
      background: linear-gradient(135deg, #1e3a5f, #2563eb);
      color: #fff;
      font-size: 0.9rem;
    }

    /* ── Empty State ── */
    .po-empty-icon { font-size: 4rem; color: #d1d5db; }

    /* ── Card ── */
    .po-card {
      background: var(--po-card-bg);
      border: 1px solid var(--po-border);
      border-radius: var(--po-radius);
      box-shadow: var(--po-shadow);
      overflow: hidden;
      transition: transform 0.22s ease, box-shadow 0.22s ease;
      display: flex;
      flex-direction: column;
    }
    .po-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--po-shadow-hover);
    }

    /* ── Card Header ── */
    .po-card-header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      padding: 16px 18px 14px;
    }
    .po-card-order-id {
      font-size: 0.72rem;
      color: rgba(255,255,255,0.6);
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .po-card-style-code {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Status Badge ── */
    .po-status-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 11px;
      border-radius: 50px;
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .po-status-planned    { background: rgba(251,191,36,0.18);  color: #fbbf24; border: 1px solid rgba(251,191,36,0.45); }
    .po-status-inprogress { background: rgba(96,165,250,0.18);  color: #93c5fd; border: 1px solid rgba(96,165,250,0.45); }
    .po-status-completed  { background: rgba(52,211,153,0.18);  color: #6ee7b7; border: 1px solid rgba(52,211,153,0.45); }
    .po-status-onhold     { background: rgba(248,113,113,0.18); color: #fca5a5; border: 1px solid rgba(248,113,113,0.45); }
    .po-status-default    { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.25); }

    /* ── Qty Banner ── */
    .po-qty-banner {
      display: flex;
      align-items: center;
      background: #f8faff;
      border-bottom: 1px solid var(--po-border);
      padding: 10px 18px;
    }
    .po-qty-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      min-width: 0;
    }
    .po-qty-label {
      font-size: 0.65rem;
      color: var(--po-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .po-qty-value {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--po-text);
    }
    .po-date-val {
      font-size: 0.78rem;
      font-weight: 600;
    }
    .po-qty-divider {
      width: 1px;
      height: 28px;
      background: var(--po-border);
      flex-shrink: 0;
    }

    /* ── Card Body ── */
    .po-card-body {
      padding: 14px 18px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Sleeve Section ── */
    .po-sleeve-title {
      display: flex;
      align-items: center;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--po-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 6px;
    }
    .po-sleeve-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      margin-right: 7px;
      flex-shrink: 0;
    }
    .po-dot-short { background: var(--po-short); }
    .po-dot-full  { background: var(--po-full); }

    /* ── Size Pills ── */
    .po-size-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .po-size-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px 4px 8px;
      border-radius: 8px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      min-width: 58px;
    }
    .po-size-pill-full { background: #f5f3ff; border-color: #ddd6fe; }
    .po-size-label {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--po-short);
      text-transform: uppercase;
    }
    .po-size-pill-full .po-size-label { color: var(--po-full); }
    .po-size-qty { font-size: 0.82rem; font-weight: 700; color: var(--po-text); }
    .po-size-legacy { font-size: 0.82rem; color: var(--po-muted); }

    /* ── Description ── */
    .po-description {
      margin-top: auto;
      padding-top: 10px;
      border-top: 1px dashed var(--po-border);
      font-size: 0.8rem;
      color: var(--po-muted);
      line-height: 1.4;
    }
  `]
})
export class ViewProductionOrderComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  orders: any[] = [];

  get totalPlanQty(): number {
    return this.orders.reduce((sum, o) => sum + (Number(o.planQty) || 0), 0);
  }

  ngOnInit() {
    this.svc.getProductionOrders().subscribe(d => this.orders = d);
  }

  hasShortSleeve(o: any): boolean {
    return (Number(o.short_S) + Number(o.short_M) + Number(o.short_L) + Number(o.short_XL)) > 0;
  }

  hasFullSleeve(o: any): boolean {
    return (Number(o.full_S) + Number(o.full_M) + Number(o.full_L) + Number(o.full_XL)) > 0;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Planned':     'planned',
      'In Progress': 'inprogress',
      'Completed':   'completed',
      'On Hold':     'onhold'
    };
    return map[status] || 'default';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'Planned':     'bi-hourglass-split',
      'In Progress': 'bi-play-circle-fill',
      'Completed':   'bi-check-circle-fill',
      'On Hold':     'bi-pause-circle-fill'
    };
    return map[status] || 'bi-circle';
  }
}
