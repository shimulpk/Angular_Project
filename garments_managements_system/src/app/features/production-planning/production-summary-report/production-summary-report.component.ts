import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-production-summary-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-bar-chart-steps me-2"></i>Production Summary Report</h5>
        </div>
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Search by Order ID</label>
              <select class="form-select" [(ngModel)]="selectedOrderId" (change)="generateReport()">
                <option value="">Select Order</option>
                <option *ngFor="let o of productionOrders" [value]="o.orderId">{{ o.orderId }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <ng-container *ngIf="selectedOrderId && reportData">
        <div class="row g-4">
          <!-- Short Sizes Table -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0">
              <div class="card-header bg-warning text-dark border-0 py-2">
                <h6 class="mb-0 fw-bold">Short Sizes</h6>
              </div>
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr><th>Size</th><th class="text-end">Produced</th><th class="text-end">Remaining</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of reportData.shortSizes">
                      <td><span class="badge bg-secondary">{{ r.size }}</span></td>
                      <td class="text-end text-success fw-semibold">{{ r.produced | number }}</td>
                      <td class="text-end" [ngClass]="r.remaining > 0 ? 'text-danger fw-bold' : 'text-muted'">
                        {{ r.remaining | number }}
                      </td>
                    </tr>
                    <tr *ngIf="reportData.shortSizes.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">No short sizes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Full Sizes Table -->
          <div class="col-md-6">
            <div class="card shadow-sm border-0">
              <div class="card-header bg-success text-white border-0 py-2">
                <h6 class="mb-0 fw-bold">Full Sizes</h6>
              </div>
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr><th>Size</th><th class="text-end">Produced</th><th class="text-end">Remaining</th></tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of reportData.fullSizes">
                      <td><span class="badge bg-success">{{ r.size }}</span></td>
                      <td class="text-end text-success fw-semibold">{{ r.produced | number }}</td>
                      <td class="text-end text-muted">{{ r.remaining | number }}</td>
                    </tr>
                    <tr *ngIf="reportData.fullSizes.length === 0">
                      <td colspan="3" class="text-center text-muted py-3">All sizes completed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <div *ngIf="!selectedOrderId" class="text-center text-muted py-5">
        <i class="bi bi-search fs-1 d-block mb-2"></i>
        Select an Order ID to view the production summary.
      </div>
    </div>
  `
})
export class ProductionSummaryReportComponent implements OnInit {
  private svc = inject(ProductionPlanningService);

  productionOrders: any[] = [];
  daywiseEntries: any[] = [];
  selectedOrderId = '';
  reportData: any = null;

  ngOnInit() {
    this.svc.getProductionOrders().subscribe(d => this.productionOrders = d);
    this.svc.getDaywiseProduction().subscribe(d => this.daywiseEntries = d);
  }

  generateReport() {
    if (!this.selectedOrderId) { this.reportData = null; return; }

    // Get all orders matching this orderId
    const ordersForId = this.productionOrders.filter(o => o.orderId === this.selectedOrderId);
    const producedForId = this.daywiseEntries.filter(e => e.orderId === this.selectedOrderId);

    // Group planned qty by size
    const planBySize: Record<string, number> = {};
    ordersForId.forEach(o => {
      planBySize[o.size] = (planBySize[o.size] || 0) + (o.planQty || 0);
    });

    // Group produced qty by size
    const producedBySize: Record<string, number> = {};
    producedForId.forEach(e => {
      producedBySize[e.size] = (producedBySize[e.size] || 0) + (e.producedQty || 0);
    });

    const allSizes = [...new Set([...Object.keys(planBySize), ...Object.keys(producedBySize)])];

    const sizeData = allSizes.map(size => ({
      size,
      planned: planBySize[size] || 0,
      produced: producedBySize[size] || 0,
      remaining: (planBySize[size] || 0) - (producedBySize[size] || 0)
    }));

    this.reportData = {
      shortSizes: sizeData.filter(s => s.remaining > 0),
      fullSizes: sizeData.filter(s => s.remaining <= 0)
    };
  }
}
