import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-finishing-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-list-task me-2"></i>Finishing Plans</h5>
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
                  <th>Section</th>
                  <th>Target Qty</th>
                  <th>Actual Qty</th>
                  <th>Defect Qty</th>
                  <th>Alter Qty</th>
                  <th>Pass Qty</th>
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
                  <td><span class="badge bg-info text-dark">{{ p.section }}</span></td>
                  <td>{{ p.targetQty | number }}</td>
                  <td>
                    <input type="number" class="form-control form-control-sm" style="width: 80px" [(ngModel)]="p.actualFinishedQty" (ngModelChange)="calculatePassQty(p)" min="0">
                  </td>
                  <td>
                    <input type="number" class="form-control form-control-sm" style="width: 80px" [(ngModel)]="p.defectQty" (ngModelChange)="calculatePassQty(p)" min="0">
                  </td>
                  <td>
                    <input type="number" class="form-control form-control-sm" style="width: 80px" [(ngModel)]="p.alterQty" (ngModelChange)="calculatePassQty(p)" min="0">
                  </td>
                  <td>
                    <span class="fw-bold text-success">{{ p.passQty | number }}</span>
                  </td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="p.status" style="width: 120px">
                      <option value="Planned">Planned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-success" (click)="savePlan(p)">
                      <i class="bi bi-save me-1"></i> Save
                    </button>
                  </td>
                </tr>
                <tr *ngIf="plans.length === 0">
                  <td colspan="12" class="text-center py-5 text-muted">No finishing plans found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewFinishingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  plans: any[] = [];

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.svc.getFinishingPlans().subscribe(data => {
      this.plans = data.map(p => ({
        ...p,
        passQty: p.passQty || (p.actualFinishedQty - (p.defectQty || 0) - (p.alterQty || 0))
      }));
    });
  }

  calculatePassQty(p: any) {
    p.passQty = (p.actualFinishedQty || 0) - (p.defectQty || 0) - (p.alterQty || 0);
    if (p.passQty < 0) p.passQty = 0;
  }

  savePlan(plan: any) {
    this.svc.updateFinishingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Finishing Plan updated successfully');
      this.loadPlans();
    });
  }
}
