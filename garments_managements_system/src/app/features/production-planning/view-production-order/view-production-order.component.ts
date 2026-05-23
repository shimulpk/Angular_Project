import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-production-order',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-list-check me-2"></i>Production Orders</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Style Code</th>
                  <th>Size</th>
                  <th>Plan Qty</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of orders">
                  <td class="fw-semibold text-primary">{{ o.orderId }}</td>
                  <td>{{ o.styleCode }}</td>
                  <td><span class="badge bg-secondary">{{ o.size }}</span></td>
                  <td>{{ o.planQty | number }}</td>
                  <td>{{ o.startDate | date }}</td>
                  <td>{{ o.endDate | date }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-success': o.status === 'Completed',
                      'bg-primary': o.status === 'In Progress',
                      'bg-warning text-dark': o.status === 'Planned',
                      'bg-danger': o.status === 'On Hold'
                    }">{{ o.status }}</span>
                  </td>
                  <td class="text-muted small">{{ o.description || '—' }}</td>
                </tr>
                <tr *ngIf="orders.length === 0">
                  <td colspan="8" class="text-center py-5 text-muted">No production orders found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewProductionOrderComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  orders: any[] = [];
  ngOnInit() { this.svc.getProductionOrders().subscribe(d => this.orders = d); }
}
