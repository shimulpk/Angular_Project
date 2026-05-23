import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-daywise-production',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-calendar3 me-2"></i>Day-wise Production Log</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Order ID</th>
                  <th>Size</th>
                  <th class="text-end">Produced Qty</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let e of entries">
                  <td>{{ e.date | date:'mediumDate' }}</td>
                  <td class="fw-semibold text-primary">{{ e.orderId }}</td>
                  <td><span class="badge bg-secondary">{{ e.size }}</span></td>
                  <td class="text-end fw-bold text-success">{{ e.producedQty | number }}</td>
                </tr>
                <tr *ngIf="entries.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">No day-wise entries found.</td>
                </tr>
              </tbody>
              <tfoot *ngIf="entries.length > 0" class="table-light">
                <tr>
                  <td colspan="3" class="fw-bold text-end">Total Produced:</td>
                  <td class="text-end fw-bold text-primary">{{ total | number }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewDaywiseProductionComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  entries: any[] = [];
  get total() { return this.entries.reduce((s, e) => s + (e.producedQty || 0), 0); }
  ngOnInit() { this.svc.getDaywiseProduction().subscribe(d => this.entries = d); }
}
