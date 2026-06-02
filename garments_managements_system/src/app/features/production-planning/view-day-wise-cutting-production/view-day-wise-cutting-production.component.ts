import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-day-wise-cutting-production',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">

      <!-- Page Header Card -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb); border-radius: 0.375rem;">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h5 class="mb-0 text-white fw-bold">
                <i class="bi bi-calendar3-week me-2"></i>Day Wise Cutting Production
              </h5>
              <small class="text-white-50">Track and review all daily cutting production entries</small>
            </div>
            <span class="badge bg-white text-primary fw-semibold px-3 py-2" style="font-size: 0.85rem;">
              {{ filteredRecords.length }} Record{{ filteredRecords.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-semibold small text-muted mb-1">
                <i class="bi bi-search me-1"></i>Search by Order ID
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-hash text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 bg-light"
                  placeholder="e.g. ORD-001, CP-1234..."
                  [(ngModel)]="searchOrderId"
                  (ngModelChange)="applyFilter()"
                  id="filter-order-id">
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small text-muted mb-1">
                <i class="bi bi-palette me-1"></i>Search by Style No
              </label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">
                  <i class="bi bi-tag text-muted"></i>
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 bg-light"
                  placeholder="e.g. NK201, IZ204..."
                  [(ngModel)]="searchStyleNo"
                  (ngModelChange)="applyFilter()"
                  id="filter-style-no">
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-semibold small text-muted mb-1">
                <i class="bi bi-calendar me-1"></i>Filter by Date
              </label>
              <input
                type="date"
                class="form-control bg-light"
                [(ngModel)]="searchDate"
                (ngModelChange)="applyFilter()"
                id="filter-date">
            </div>
            <div class="col-12 d-flex gap-2 justify-content-end">
              <button class="btn btn-sm btn-outline-secondary px-3" (click)="clearFilters()">
                <i class="bi bi-x-circle me-1"></i>Clear Filters
              </button>
              <button class="btn btn-sm btn-outline-primary px-3" (click)="loadRecords()">
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-3">Loading production records...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredRecords.length === 0" class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
          <h5 class="text-muted">No Production Records Found</h5>
          <p class="text-muted small mb-0" *ngIf="allRecords.length === 0">
            No cutting production entries have been saved yet. Use <strong>Add Day Wise Cutting Production</strong> to log entries.
          </p>
          <p class="text-muted small mb-0" *ngIf="allRecords.length > 0">
            No records match your current filters. <a href="javascript:void(0)" (click)="clearFilters()">Clear filters</a> to see all {{ allRecords.length }} record(s).
          </p>
        </div>
      </div>

      <!-- Records Table -->
      <div *ngIf="!loading && filteredRecords.length > 0" class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr style="background: linear-gradient(135deg, #f8faff, #eef2ff);">
                  <th class="py-3 ps-4 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">Date / Shift</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Style No</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Stage</th>
                  <th class="py-3 text-muted fw-semibold text-center" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Target</th>
                  <th class="py-3 text-muted fw-semibold text-center" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Actual</th>
                  <th class="py-3 text-muted fw-semibold text-center" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Reject</th>
                  <th class="py-3 text-muted fw-semibold text-center" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Remaining</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Lines</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px;">Supervisor</th>
                  <th class="py-3 text-muted fw-semibold" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;">Efficiency</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rec of filteredRecords" class="record-row">
                  <!-- Date / Shift -->
                  <td class="ps-4 py-3">
                    <div class="fw-semibold" style="font-size: 0.9rem;">{{ rec.date | date:'dd MMM yyyy' }}</div>
                    <span class="badge mt-1"
                      [ngClass]="rec.shift === 'Morning' ? 'bg-warning text-dark' : 'bg-info text-dark'"
                      style="font-size: 0.7rem;">
                      <i class="bi me-1" [ngClass]="rec.shift === 'Morning' ? 'bi-sunrise' : 'bi-moon-stars'"></i>
                      {{ rec.shift || 'N/A' }}
                    </span>
                  </td>

                  <!-- Order ID -->
                  <td class="py-3">
                    <span class="fw-bold text-primary">{{ rec.order_id || '—' }}</span>
                  </td>

                  <!-- Style No -->
                  <td class="py-3">
                    <span class="badge bg-light text-dark border" style="font-size: 0.8rem;">{{ rec.style_no || '—' }}</span>
                  </td>

                  <!-- Stage -->
                  <td class="py-3">
                    <span class="badge bg-secondary" style="font-size: 0.78rem;">{{ rec.stage || 'Cutting' }}</span>
                  </td>

                  <!-- Target -->
                  <td class="py-3 text-center">
                    <span class="fw-semibold">{{ rec.target_quantity | number }}</span>
                  </td>

                  <!-- Actual -->
                  <td class="py-3 text-center">
                    <span class="fw-bold text-success">{{ rec.actual_quantity | number }}</span>
                  </td>

                  <!-- Reject -->
                  <td class="py-3 text-center">
                    <span class="fw-bold" [ngClass]="rec.reject_quantity > 0 ? 'text-danger' : 'text-muted'">
                      {{ rec.reject_quantity | number }}
                    </span>
                  </td>

                  <!-- Remaining -->
                  <td class="py-3 text-center">
                    <span class="fw-bold"
                      [ngClass]="{
                        'text-success': getRemainingQty(rec) === 0,
                        'text-danger':  getRemainingQty(rec) < 0,
                        'text-warning': getRemainingQty(rec) > 0
                      }">
                      {{ getRemainingQty(rec) | number }}
                    </span>
                  </td>

                  <!-- Line Allocations -->
                  <td class="py-3">
                    <ng-container *ngIf="rec.line_allocations && rec.line_allocations.length > 0; else noLines">
                      <div *ngFor="let la of rec.line_allocations" class="d-flex align-items-center gap-1 mb-1">
                        <span class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25"
                          style="font-size: 0.72rem;">
                          {{ la.line_id }}
                        </span>
                        <span class="text-muted" style="font-size: 0.8rem;">{{ la.quantity | number }} pcs</span>
                      </div>
                    </ng-container>
                    <ng-template #noLines>
                      <span class="text-muted small">—</span>
                    </ng-template>
                  </td>

                  <!-- Supervisor -->
                  <td class="py-3">
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-xs bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                        style="width: 28px; height: 28px; font-size: 0.75rem; flex-shrink: 0;">
                        {{ rec.supervisor_name?.charAt(0) || '?' }}
                      </div>
                      <span style="font-size: 0.85rem;">{{ rec.supervisor_name || '—' }}</span>
                    </div>
                  </td>

                  <!-- Efficiency Progress -->
                  <td class="py-3">
                    <div class="d-flex align-items-center gap-2" style="min-width: 100px;">
                      <div class="progress flex-grow-1" style="height: 6px;">
                        <div class="progress-bar"
                          [ngClass]="{
                            'bg-success': getEfficiency(rec) >= 80,
                            'bg-warning':  getEfficiency(rec) >= 50 && getEfficiency(rec) < 80,
                            'bg-danger':   getEfficiency(rec) < 50
                          }"
                          role="progressbar"
                          [style.width.%]="getEfficiency(rec)"
                          aria-valuemin="0" aria-valuemax="100">
                        </div>
                      </div>
                      <span class="fw-semibold"
                        [ngClass]="{
                          'text-success': getEfficiency(rec) >= 80,
                          'text-warning':  getEfficiency(rec) >= 50 && getEfficiency(rec) < 80,
                          'text-danger':   getEfficiency(rec) < 50
                        }"
                        style="font-size: 0.8rem; white-space: nowrap;">
                        {{ getEfficiency(rec) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table Footer Summary -->
        <div class="card-footer bg-light border-0 py-3">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3">
              <div class="text-muted small">Total Target</div>
              <div class="fw-bold text-primary fs-6">{{ getTotalTarget() | number }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small">Total Actual</div>
              <div class="fw-bold text-success fs-6">{{ getTotalActual() | number }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small">Total Reject</div>
              <div class="fw-bold text-danger fs-6">{{ getTotalReject() | number }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small">Overall Efficiency</div>
              <div class="fw-bold fs-6"
                [ngClass]="{
                  'text-success': getOverallEfficiency() >= 80,
                  'text-warning':  getOverallEfficiency() >= 50 && getOverallEfficiency() < 80,
                  'text-danger':   getOverallEfficiency() < 50
                }">
                {{ getOverallEfficiency() }}%
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .record-row {
      transition: background 0.15s ease;
    }
    .record-row:hover {
      background: rgba(37, 99, 235, 0.03) !important;
    }
  `]
})
export class ViewDayWiseCuttingProductionComponent implements OnInit {
  private svc = inject(ProductionPlanningService);

  allRecords: any[] = [];
  filteredRecords: any[] = [];
  loading = false;

  searchOrderId = '';
  searchStyleNo  = '';
  searchDate     = '';

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    this.svc.getDayWiseCuttingProduction().subscribe({
      next: data => {
        // Sort newest first
        this.allRecords = data.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    const orderId  = this.searchOrderId.toLowerCase().trim();
    const styleNo  = this.searchStyleNo.toLowerCase().trim();
    const date     = this.searchDate;

    this.filteredRecords = this.allRecords.filter(rec => {
      const matchOrder = !orderId || (rec.order_id || '').toLowerCase().includes(orderId);
      const matchStyle = !styleNo  || (rec.style_no  || '').toLowerCase().includes(styleNo);
      const matchDate  = !date     || rec.date === date;
      return matchOrder && matchStyle && matchDate;
    });
  }

  clearFilters() {
    this.searchOrderId = '';
    this.searchStyleNo  = '';
    this.searchDate     = '';
    this.applyFilter();
  }

  getRemainingQty(rec: any): number {
    const target = Number(rec.target_quantity)  || 0;
    const actual = Number(rec.actual_quantity)  || 0;
    const reject = Number(rec.reject_quantity)  || 0;
    return target - (actual + reject);
  }

  getEfficiency(rec: any): number {
    const target = Number(rec.target_quantity) || 1;
    const actual = Number(rec.actual_quantity) || 0;
    return Math.min(100, Math.round((actual / target) * 100));
  }

  getTotalTarget()  { return this.filteredRecords.reduce((s, r) => s + (Number(r.target_quantity) || 0), 0); }
  getTotalActual()  { return this.filteredRecords.reduce((s, r) => s + (Number(r.actual_quantity) || 0), 0); }
  getTotalReject()  { return this.filteredRecords.reduce((s, r) => s + (Number(r.reject_quantity) || 0), 0); }

  getOverallEfficiency(): number {
    const target = this.getTotalTarget() || 1;
    const actual = this.getTotalActual();
    return Math.min(100, Math.round((actual / target) * 100));
  }
}
