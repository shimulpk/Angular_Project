import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-packing-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-list-task me-2"></i>Packing & Shipping Plans</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Plan ID</th>
                  <th>Order ID</th>
                  <th>Style</th>
                  <th>Size</th>
                  <th>Cartons</th>
                  <th>Weight (kg)</th>
                  <th>Total Order Qty</th>
                  <th>Total Packed Qty</th>
                  <th>Remaining Qty</th>
                  <th>Destination</th>
                  <th>Shipment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of plans">
                  <td class="fw-semibold">#{{ p.id }}</td>
                  <td class="text-primary fw-semibold">{{ p.orderId }}</td>
                  <td>{{ p.style }}</td>
                  <td><span class="badge bg-secondary">{{ p.size }}</span></td>
                  <td>{{ p.cartonQty | number }}</td>
                  <td>{{ p.grossWeight }} kg</td>
                  <td>{{ p.totalOrderQty | number }}</td>
                  <td>
                    <input type="number" class="form-control form-control-sm" style="width: 100px" [(ngModel)]="p.totalPackedQty" (ngModelChange)="calculateRemaining(p)" min="0">
                  </td>
                  <td>
                    <span [ngClass]="p.remainingQty > 0 ? 'text-danger fw-bold' : 'text-muted'">
                      {{ p.remainingQty | number }}
                    </span>
                  </td>
                  <td>{{ p.destination }}</td>
                  <td>{{ p.shipmentDate | date:'mediumDate' }}</td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="p.status" style="width: 120px">
                      <option value="Planned">Planned</option>
                      <option value="Packed">Packed</option>
                      <option value="Shipped">Shipped</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-success" (click)="savePlan(p)">
                      <i class="bi bi-save me-1"></i> Save
                    </button>
                  </td>
                </tr>
                <tr *ngIf="plans.length === 0">
                  <td colspan="13" class="text-center py-5 text-muted">No packing plans found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewPackingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  plans: any[] = [];

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.svc.getPackingPlans().subscribe(data => {
      this.plans = data.map(p => ({
        ...p,
        remainingQty: p.remainingQty !== undefined ? p.remainingQty : (p.totalOrderQty - (p.totalPackedQty || 0))
      }));
    });
  }

  calculateRemaining(p: any) {
    p.remainingQty = (p.totalOrderQty || 0) - (p.totalPackedQty || 0);
    if (p.remainingQty < 0) p.remainingQty = 0;
  }

  savePlan(plan: any) {
    this.svc.updatePackingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Packing Plan updated successfully');
      this.loadPlans();
    });
  }
}
