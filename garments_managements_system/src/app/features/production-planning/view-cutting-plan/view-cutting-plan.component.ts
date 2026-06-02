import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-cutting-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-list-task me-2"></i>Cutting Plans</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Plan ID</th>
                  <th>Order ID</th>
                  <th>Style No</th>
                  <th>Planned Pieces</th>
                  <th>Actual Pieces</th>
                  <th>Marker Efficiency</th>
                  <th>Assigned To</th>
                  <th>Cutting Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of plans">
                  <td class="fw-semibold">{{ p.cutting_plan_id || '#' + p.id }}</td>
                  <td class="text-primary fw-semibold">{{ p.order_id || p.orderId }}</td>
                  <td>{{ p.style_no || p.style }}</td>
                  <td>{{ p.planned_pieces || p.targetQty | number }}</td>
                  <td>
                    <input type="number" class="form-control form-control-sm" style="width: 100px" [(ngModel)]="p.actual_pieces" min="0">
                  </td>
                  <td>{{ p.marker_efficiency ? p.marker_efficiency + '%' : '-' }}</td>
                  <td>{{ p.assigned_to || '-' }}</td>
                  <td>{{ p.cutting_date || p.cuttingDate | date:'mediumDate' }}</td>
                  <td>
                    <select class="form-select form-select-sm" [(ngModel)]="p.status" style="width: 130px">
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
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
                  <td colspan="10" class="text-center py-5 text-muted">No cutting plans found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewCuttingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  plans: any[] = [];

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.svc.getCuttingPlans().subscribe(data => this.plans = data);
  }

  savePlan(plan: any) {
    this.svc.updateCuttingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Cutting Plan updated successfully');
      this.loadPlans();
    });
  }
}
