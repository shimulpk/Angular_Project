import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { StyleService } from '../../../core/services/style.service';

@Component({
  selector: 'app-production-summary-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      
      <!-- Dashboard Header -->
      <div class="card shadow-sm border-0 mb-4 animate-fade-in" style="border-radius:12px; overflow:hidden;">
        <div class="card-header border-0 py-4 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
                <i class="bi bi-bar-chart-steps fs-4 text-white"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Live Production Summary Board</h5>
                <small class="text-white-50">Real-time WIP, progress tracking, reject auditing, and shipping statuses</small>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-light text-primary fw-semibold btn-sm px-3 shadow-sm" (click)="exportToCSV()">
                <i class="bi bi-file-earmark-excel me-1"></i> Export to Excel
              </button>
              <button class="btn btn-outline-light btn-sm px-3" (click)="printReport()">
                <i class="bi bi-printer me-1"></i> Print / PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Factory WIP Indicators -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 text-center bg-light-blue" style="border-radius:10px;">
            <span class="text-muted small uppercase fw-bold" style="font-size:0.7rem; letter-spacing:0.5px;">Cutting WIP</span>
            <h4 class="fw-bold text-primary mt-1 mb-0">{{ factoryTotals.cuttingWIP | number }} <small style="font-size:0.75rem;">pcs</small></h4>
            <span class="text-muted" style="font-size:0.7rem;">Fabric planned but uncut</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 text-center bg-light-purple" style="border-radius:10px;">
            <span class="text-muted small uppercase fw-bold" style="font-size:0.7rem; letter-spacing:0.5px;">Sewing WIP</span>
            <h4 class="fw-bold text-purple mt-1 mb-0">{{ factoryTotals.sewingWIP | number }} <small style="font-size:0.75rem;">pcs</small></h4>
            <span class="text-muted" style="font-size:0.7rem;">Cut fabric inside lines</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 text-center bg-light-orange" style="border-radius:10px;">
            <span class="text-muted small uppercase fw-bold" style="font-size:0.7rem; letter-spacing:0.5px;">Finishing WIP</span>
            <h4 class="fw-bold text-warning mt-1 mb-0">{{ factoryTotals.finishingWIP | number }} <small style="font-size:0.75rem;">pcs</small></h4>
            <span class="text-muted" style="font-size:0.7rem;">Sewn garments at iron/QC</span>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm p-3 text-center bg-light-green" style="border-radius:10px;">
            <span class="text-muted small uppercase fw-bold" style="font-size:0.7rem; letter-spacing:0.5px;">Packing WIP</span>
            <h4 class="fw-bold text-success mt-1 mb-0">{{ factoryTotals.packingWIP | number }} <small style="font-size:0.75rem;">pcs</small></h4>
            <span class="text-muted" style="font-size:0.7rem;">Finished garments uncartoned</span>
          </div>
        </div>
      </div>

      <!-- Filters Panel -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:12px;">
        <div class="card-body py-3 px-4">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1"><i class="bi bi-funnel me-1"></i>Search Buyer / Style</label>
              <input type="text" class="form-control form-control-sm bg-light" 
                     placeholder="e.g. Inditex, NK201..." [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
            </div>
            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1"><i class="bi bi-flag me-1"></i>Shipment Status</label>
              <select class="form-select form-select-sm bg-light" [(ngModel)]="selectedStatus" (change)="applyFilters()">
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Production">In Production</option>
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Completed">Completed / Shipped</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-muted mb-1"><i class="bi bi-calendar-range me-1"></i>Shipment Date Range</label>
              <div class="d-flex gap-2">
                <input type="date" class="form-control form-control-sm bg-light" [(ngModel)]="startDate" (change)="applyFilters()">
                <span class="text-muted align-self-center">to</span>
                <input type="date" class="form-control form-control-sm bg-light" [(ngModel)]="endDate" (change)="applyFilters()">
              </div>
            </div>
            <div class="col-md-2 d-flex gap-2 justify-content-end">
              <button class="btn btn-sm btn-outline-secondary w-100" (click)="clearFilters()"><i class="bi bi-x-circle me-1"></i>Reset</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3">Loading real-time calculations...</p>
      </div>

      <!-- Main Summary Table -->
      <div *ngIf="!loading && filteredRows.length > 0" class="card border-0 shadow-sm" style="border-radius:12px; overflow:hidden;">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 text-sm">
            <thead>
              <tr class="table-header-gradient text-white">
                <th class="py-3 ps-4">Style No</th>
                <th class="py-3">Buyer Name</th>
                <th class="py-3 text-center">Order Target</th>
                <th class="py-3 text-center table-sub-header bg-cutting">Total Cut</th>
                <th class="py-3 text-center table-sub-header bg-cutting">Cutting WIP</th>
                <th class="py-3 text-center table-sub-header bg-sewing">Total Sewn</th>
                <th class="py-3 text-center table-sub-header bg-sewing">Sewing WIP</th>
                <th class="py-3 text-center table-sub-header bg-finishing">Total Finished</th>
                <th class="py-3 text-center table-sub-header bg-finishing">Finishing WIP</th>
                <th class="py-3 text-center table-sub-header bg-packing">Total Packed</th>
                <th class="py-3 text-center table-sub-header bg-packing">Packing WIP</th>
                <th class="py-3 text-center">Rejects</th>
                <th class="py-3 text-center" style="width: 120px;">Overall Progress</th>
                <th class="py-3 text-center">Ship Date / Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of filteredRows" [ngClass]="{'border-danger-alert': isNearShipmentAndSlow(row)}">
                <!-- Style No -->
                <td class="ps-4 py-3 fw-bold text-dark">
                  {{ row.styleNo }}
                  <span *ngIf="isNearShipmentAndSlow(row)" class="badge bg-danger ms-1 animate-pulse" title="Shipment Date Nearing! Progress Slow.">
                    <i class="bi bi-exclamation-triangle"></i> ALERT
                  </span>
                </td>

                <!-- Buyer Name -->
                <td class="py-3 fw-medium text-secondary">{{ row.buyerName }}</td>

                <!-- Order Target -->
                <td class="py-3 text-center fw-bold">{{ row.targetQty | number }}</td>

                <!-- Total Cut -->
                <td class="py-3 text-center fw-semibold text-dark">{{ row.totalCut | number }}</td>

                <!-- Cutting WIP -->
                <td class="py-3 text-center">
                  <span class="badge" [ngClass]="row.cuttingWIP > 0 ? 'bg-secondary-subtle text-secondary' : 'bg-success-subtle text-success'">
                    {{ row.cuttingWIP | number }}
                  </span>
                </td>

                <!-- Total Sewn -->
                <td class="py-3 text-center fw-semibold text-dark">{{ row.totalSewn | number }}</td>

                <!-- Sewing WIP -->
                <td class="py-3 text-center">
                  <span class="badge" [ngClass]="row.sewingWIP > 0 ? 'bg-primary-subtle text-primary fw-bold' : 'bg-success-subtle text-success'">
                    {{ row.sewingWIP | number }}
                  </span>
                </td>

                <!-- Total Finished -->
                <td class="py-3 text-center fw-semibold text-dark">{{ row.totalFinished | number }}</td>

                <!-- Finishing WIP -->
                <td class="py-3 text-center">
                  <span class="badge" [ngClass]="row.finishingWIP > 0 ? 'bg-warning-subtle text-warning-emphasis fw-bold' : 'bg-success-subtle text-success'">
                    {{ row.finishingWIP | number }}
                  </span>
                </td>

                <!-- Total Packed -->
                <td class="py-3 text-center fw-bold text-success">{{ row.totalPacked | number }}</td>

                <!-- Packing WIP -->
                <td class="py-3 text-center">
                  <span class="badge" [ngClass]="row.packingWIP > 0 ? 'bg-success-subtle text-successfw-bold' : 'bg-light text-muted'">
                    {{ row.packingWIP | number }}
                  </span>
                </td>

                <!-- Total Rejected -->
                <td class="py-3 text-center fw-semibold text-danger">{{ row.totalRejects | number }}</td>

                <!-- Progress Bar -->
                <td class="py-3">
                  <div class="d-flex justify-content-between align-items-center mb-1 small">
                    <span class="fw-bold" [ngClass]="{'text-danger': row.overallProgress < 50, 'text-success': row.overallProgress >= 100}">
                      {{ row.overallProgress }}%
                    </span>
                  </div>
                  <div class="progress" style="height: 6px; border-radius: 4px;">
                    <div class="progress-bar" 
                         [ngClass]="{
                           'bg-danger': row.overallProgress < 40,
                           'bg-warning': row.overallProgress >= 40 && row.overallProgress < 90,
                           'bg-success': row.overallProgress >= 90
                         }" 
                         role="progressbar" 
                         [style.width.%]="row.overallProgress" 
                         aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                </td>

                <!-- Ship Date / Status -->
                <td class="py-3 text-center">
                  <span class="badge rounded-pill px-3 py-1 mb-1 d-block" [ngClass]="{
                    'bg-warning-subtle text-warning border border-warning': row.status === 'Pending' || row.status === 'DRAFT', 
                    'bg-primary-subtle text-primary border border-primary': row.status === 'In Progress' || row.status === 'IN_PRODUCTION' || row.status === 'In Packing' || row.status === 'In Finishing', 
                    'bg-success-subtle text-success border border-success': row.status === 'Completed' || row.status === 'Ready to Ship' || row.status === 'Shipped'
                  }">
                    {{ row.status }}
                  </span>
                  <small class="text-muted d-block" style="font-size:0.75rem;">
                    <i class="bi bi-calendar-event me-1"></i>{{ row.shipDate | date:'mediumDate' }}
                  </small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredRows.length === 0" class="card border-0 shadow-sm text-center py-5" style="border-radius:12px;">
        <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
        <h5 class="text-muted">No Production Runs Match Filters</h5>
        <p class="text-muted small">Try tweaking your search parameters or date ranges.</p>
      </div>

    </div>
  `,
  styles: [`
    .table-header-gradient {
      background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%);
    }
    .th-style {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .bg-light-blue { background-color: #f0f9ff; border: 1px solid #bae6fd; }
    .bg-light-purple { background-color: #faf5ff; border: 1px solid #e9d5ff; }
    .bg-light-orange { background-color: #fffbeb; border: 1px solid #fef3c7; }
    .bg-light-green { background-color: #f0fdf4; border: 1px solid #bbf7d0; }
    .text-purple { color: #7c3aed; }
    .bg-cutting { background-color: rgba(30, 58, 95, 0.08) !important; color: #1e3a5f !important; }
    .bg-sewing { background-color: rgba(124, 58, 237, 0.08) !important; color: #7c3aed !important; }
    .bg-finishing { background-color: rgba(245, 158, 11, 0.08) !important; color: #b45309 !important; }
    .bg-packing { background-color: rgba(16, 185, 129, 0.08) !important; color: #047857 !important; }
    .border-danger-alert {
      border-left: 4px solid #ef4444 !important;
      background-color: #fef2f2 !important;
    }
    .animate-pulse {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
  `]
})
export class ProductionSummaryReportComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private buyerSvc = inject(BuyerService);
  private styleSvc = inject(StyleService);

  loading = false;
  allRows: any[] = [];
  filteredRows: any[] = [];

  // Factory totals
  factoryTotals = {
    cuttingWIP: 0,
    sewingWIP: 0,
    finishingWIP: 0,
    packingWIP: 0
  };

  // Filters
  searchQuery = '';
  selectedStatus = '';
  startDate = '';
  endDate = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    forkJoin({
      orders: this.orderSvc.getOrders(),
      buyers: this.buyerSvc.getBuyers(),
      styles: this.styleSvc.getStyles(),
      cutting: this.svc.getDayWiseCuttingProduction(),
      sewing: this.svc.getDayWiseSewingProduction(),
      finishing: this.svc.getDayWiseFinishingProduction(),
      packing: this.svc.getDayWisePackingProduction()
    }).subscribe({
      next: ({ orders, buyers, styles, cutting, sewing, finishing, packing }) => {
        this.allRows = orders.map((order: any) => {
          // Find style code
          let styleCode = 'N/A';
          const style = styles.find((s: any) => s.id === order.styleId);
          if (style) styleCode = style.styleCode;

          // Find buyer name
          let buyerName = 'N/A';
          const buyer = buyers.find((b: any) => (b.id ?? b.buyerId) === order.buyerId);
          if (buyer) buyerName = buyer.companyName ?? buyer.name;

          // Sum Target quantity
          const targetQty = Number(order.totalQuantity) || 
                            order.items?.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) || 0;

          // Aggregates for Cutting
          const matchedCutting = cutting.filter(c => 
            (c.style_no === styleCode || c.order_id === order.id || c.order_id === order.orderId)
          );
          const totalCut = matchedCutting.reduce((sum, c) => sum + (Number(c.actual_cut_pieces) || Number(c.actual_quantity) || 0), 0);
          const cuttingWIP = Math.max(0, targetQty - totalCut);
          const cuttingRejects = matchedCutting.reduce((sum, c) => sum + (Number(c.reject_pieces) || Number(c.reject_quantity) || 0), 0);

          // Aggregates for Sewing
          const matchedSewing = sewing.filter(s => 
            (s.style_no === styleCode || s.order_no === order.poNumber)
          );
          const totalSewn = matchedSewing.reduce((sum, s) => sum + (Number(s.achieved_quantity) || 0), 0);
          const sewingWIP = Math.max(0, totalCut - totalSewn);
          const sewingRejects = matchedSewing.reduce((sum, s) => sum + (Number(s.rejection_qty) || 0), 0);

          // Aggregates for Finishing
          const matchedFinishing = finishing.filter(f => 
            (f.style_no === styleCode || f.order_no === order.poNumber)
          );
          const totalFinished = matchedFinishing.reduce((sum, f) => sum + (Number(f.pass_qty) || 0), 0);
          const finishingWIP = Math.max(0, totalSewn - totalFinished);
          const finishingRejects = matchedFinishing.reduce((sum, f) => sum + (Number(f.reject_qty) || 0), 0);

          // Aggregates for Packing
          const matchedPacking = packing.filter(p => 
            (p.style_no === styleCode || p.order_no === order.poNumber)
          );
          const totalPacked = matchedPacking.reduce((sum, p) => sum + (Number(p.today_packed_qty) || 0), 0);
          const packingWIP = Math.max(0, totalFinished - totalPacked);
          const packingRejects = matchedPacking.reduce((sum, p) => sum + (Number(p.today_reject_qty) || 0), 0);

          // Final calculations
          const totalRejects = cuttingRejects + sewingRejects + finishingRejects + packingRejects;
          const overallProgress = targetQty > 0 ? Math.min(100, Math.round((totalPacked / targetQty) * 100)) : 0;

          return {
            orderId: order.id,
            poNumber: order.poNumber,
            styleNo: styleCode,
            buyerName: buyerName,
            targetQty,
            totalCut,
            cuttingWIP,
            totalSewn,
            sewingWIP,
            totalFinished,
            finishingWIP,
            totalPacked,
            packingWIP,
            totalRejects,
            overallProgress,
            shipDate: order.shipDate || order.endDate || '',
            status: order.status || 'Pending'
          };
        });

        this.calculateFactoryWIP();
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateFactoryWIP() {
    this.factoryTotals.cuttingWIP = this.allRows.reduce((sum, r) => sum + r.cuttingWIP, 0);
    this.factoryTotals.sewingWIP = this.allRows.reduce((sum, r) => sum + r.sewingWIP, 0);
    this.factoryTotals.finishingWIP = this.allRows.reduce((sum, r) => sum + r.finishingWIP, 0);
    this.factoryTotals.packingWIP = this.allRows.reduce((sum, r) => sum + r.packingWIP, 0);
  }

  applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    const status = this.selectedStatus;
    const start = this.startDate ? new Date(this.startDate).getTime() : 0;
    const end = this.endDate ? new Date(this.endDate).getTime() : 0;

    this.filteredRows = this.allRows.filter(row => {
      const matchQuery = !q || row.styleNo.toLowerCase().includes(q) || row.buyerName.toLowerCase().includes(q);
      const matchStatus = !status || row.status === status || 
                          (status === 'Completed' && (row.status === 'Completed' || row.status === 'Shipped' || row.status === 'Ready to Ship'));
      
      let matchDate = true;
      if (start || end) {
        const rowTime = new Date(row.shipDate).getTime();
        if (isNaN(rowTime)) {
          matchDate = false;
        } else {
          if (start && rowTime < start) matchDate = false;
          if (end && rowTime > end) matchDate = false;
        }
      }

      return matchQuery && matchStatus && matchDate;
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.applyFilters();
  }

  isNearShipmentAndSlow(row: any): boolean {
    if (row.overallProgress >= 90) return false;
    if (!row.shipDate) return false;
    const shipTime = new Date(row.shipDate).getTime();
    const now = new Date().getTime();
    const diffDays = (shipTime - now) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7; // Within 7 days and not completed yet
  }

  printReport() {
    window.print();
  }

  exportToCSV() {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Style No,Buyer Name,Order Quantity,Total Cut,Cutting WIP,Total Sewn,Sewing WIP,Total Finished,Finishing WIP,Total Packed,Packing WIP,Total Rejected,Overall Progress,Ship Date,Status\n';

    this.filteredRows.forEach(row => {
      const line = [
        row.styleNo,
        `"${row.buyerName}"`,
        row.targetQty,
        row.totalCut,
        row.cuttingWIP,
        row.totalSewn,
        row.sewingWIP,
        row.totalFinished,
        row.finishingWIP,
        row.totalPacked,
        row.packingWIP,
        row.totalRejects,
        `${row.overallProgress}%`,
        row.shipDate,
        row.status
      ].join(',');
      csvContent += line + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Production_Summary_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
