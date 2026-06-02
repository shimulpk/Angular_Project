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
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-grid me-2"></i>Packing & Shipping Plans</h5>
        </div>
      </div>
      
      <div class="row g-4">
        <div class="col-12 text-center py-5 text-muted" *ngIf="plans.length === 0">
          <i class="bi bi-inbox fs-1 d-block mb-3"></i>
          <h5>No Packing Plans Found</h5>
          <p>Create a new packing plan to see it here.</p>
        </div>

        <div class="col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card h-100 shadow-sm border-0 plan-card">
            <!-- Header -->
            <div class="card-header border-0 bg-white d-flex justify-content-between align-items-center pt-3 pb-2">
              <h6 class="mb-0 text-primary fw-bold">
                <i class="bi bi-box-seam-fill me-2"></i>{{ p.packing_plan_id || 'PKG-#' + p.id }}
              </h6>
              <span class="badge" [ngClass]="{
                'bg-warning text-dark': p.status === 'Pending', 
                'bg-primary': p.status === 'In Progress', 
                'bg-success': p.status === 'Shipped' || p.status === 'Completed'
              }">
                {{ p.status }}
              </span>
            </div>
            
            <!-- Body -->
            <div class="card-body pt-2 pb-3">
              <!-- Info Grid -->
              <div class="row g-2 mb-3 text-sm">
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Order ID</div>
                  <div class="fw-semibold">{{ p.order_id || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Style No</div>
                  <div class="fw-semibold">{{ p.style_no || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Buyer</div>
                  <div class="fw-semibold text-truncate" title="{{ p.buyer_name }}">{{ p.buyer_name || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-muted" style="font-size: 0.75rem;">Destination</div>
                  <div class="fw-semibold text-truncate" title="{{ p.destination }}">{{ p.destination || 'N/A' }}</div>
                </div>
              </div>

              <!-- Shipment Timeline -->
              <div class="mb-3 px-3 py-2 bg-light rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <i class="bi bi-truck text-muted me-2"></i>
                  <span style="font-size: 0.75rem;" class="text-muted me-1">Ship By:</span>
                  <span style="font-size: 0.85rem;" class="fw-medium text-danger">{{ p.shipment_date | date:'mediumDate' }}</span>
                </div>
              </div>

              <!-- Packing Specs -->
              <div class="mb-3 border rounded p-2 text-center" style="font-size: 0.8rem;">
                <div class="row g-0 align-items-center">
                  <div class="col-4 border-end">
                    <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Method</span>
                    <span class="fw-semibold text-primary">{{ p.packing_method || 'N/A' }}</span>
                  </div>
                  <div class="col-4 border-end">
                    <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Cartons</span>
                    <span class="fw-bold">{{ p.carton_qty || 0 }} <span class="fw-normal text-muted small">x {{ p.pcs_per_carton || 0 }}</span></span>
                  </div>
                  <div class="col-4">
                    <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Hang Tag</span>
                    <span class="badge" [ngClass]="p.hang_tag ? 'bg-info text-dark' : 'bg-light text-muted border'">{{ p.hang_tag ? 'Yes' : 'No' }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Packing Progress Status Banner -->
              <div class="alert mb-2 py-1 px-2 d-flex justify-content-between align-items-center"
                   [ngClass]="getComputed(p) === (p.total_packed_qty || 0) ? 'alert-success' : 'alert-warning'"
                   style="font-size: 0.75rem;">
                <span>Computed Total: <strong>{{ getComputed(p) }}</strong></span>
                <span><i class="bi" [ngClass]="getComputed(p) === (p.total_packed_qty || 0) ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i></span>
              </div>

              <!-- Editable Quantities -->
              <div class="row g-2 mt-2">
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Total Packed Qty</label>
                  <input type="number" class="form-control form-control-sm text-success fw-bold" [(ngModel)]="p.total_packed_qty" min="0">
                </div>
                <div class="col-6">
                  <label class="text-muted" style="font-size: 0.75rem;">Rejection Qty</label>
                  <input type="number" class="form-control form-control-sm text-danger fw-bold" [(ngModel)]="p.rejection_qty" min="0">
                </div>
              </div>

            </div>
            
            <!-- Card Footer -->
            <div class="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <label class="text-muted small mb-0">Status:</label>
                <select class="form-select form-select-sm" style="width: 100px" [(ngModel)]="p.status">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Shipped">Shipped</option>
                </select>
              </div>
              <button class="btn btn-sm btn-primary px-3 shadow-sm" (click)="savePlan(p)">
                <i class="bi bi-save me-1"></i> Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
    }
  `]
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
      this.plans = data;
    });
  }

  getComputed(plan: any): number {
    return (Number(plan.carton_qty) || 0) * (Number(plan.pcs_per_carton) || 0);
  }

  savePlan(plan: any) {
    plan.computed_total = this.getComputed(plan);
    this.svc.updatePackingPlan(plan.id, plan).subscribe(() => {
      this.notify.success('Packing Plan updated successfully');
      this.loadPlans();
    });
  }
}
