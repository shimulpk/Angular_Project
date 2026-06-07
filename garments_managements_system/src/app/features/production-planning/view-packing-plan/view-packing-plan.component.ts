import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';

@Component({
  selector: 'app-view-packing-plan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      
      <!-- Title Card -->
      <div class="card shadow-sm border-0 mb-4" style="border-radius:12px; overflow:hidden;">
        <div class="card-header border-0 py-3 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:40px;height:40px;background:rgba(255,255,255,0.15);">
                <i class="bi bi-grid-3x3-gap-fill text-white fs-5"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Packing & Shipping Summary</h5>
                <small class="text-white-50">Live status of packing progress, cartons packed, defects and commercial invoicing</small>
              </div>
            </div>
            <button class="btn btn-sm btn-light text-primary fw-semibold px-3" (click)="loadData()">
              <i class="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="row g-4">
        <!-- Empty State -->
        <div class="col-12 text-center py-5 text-muted" *ngIf="plans.length === 0">
          <i class="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
          <h5 class="fw-bold">No Packing Plans Found</h5>
          <p class="mb-0">Create a packing plan to track shipping and invoicing here.</p>
        </div>

        <!-- Packing Plan Cards -->
        <div class="col-md-6 col-xl-4" *ngFor="let p of plans">
          <div class="card h-100 shadow-sm border-0 plan-card" style="border-radius:12px; border-top: 4px solid #7c3aed !important;">
            <!-- Header -->
            <div class="card-header border-0 bg-white d-flex justify-content-between align-items-center pt-3 pb-2">
              <div>
                <h6 class="mb-0 text-primary fw-bold" style="letter-spacing:-0.3px;">
                  <i class="bi bi-box-seam-fill me-2 text-warning"></i>{{ p.packing_plan_id || 'PKG-#' + p.id }}
                </h6>
                <small class="text-muted" style="font-size:0.75rem;">Finishing Ref: {{ p.finishing_plan_id || 'N/A' }}</small>
              </div>
              <span class="badge px-3 py-2 rounded-pill" [ngClass]="{
                'bg-warning-subtle text-warning-emphasis border border-warning-subtle': p.status === 'In Packing', 
                'bg-success-subtle text-success-emphasis border border-success-subtle': p.status === 'Ready to Ship' || p.status === 'Completed',
                'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle': p.status !== 'In Packing' && p.status !== 'Ready to Ship' && p.status !== 'Completed'
              }">
                {{ p.status }}
              </span>
            </div>
            
            <!-- Body -->
            <div class="card-body pt-2 pb-3">
              <!-- Info Block -->
              <div class="mb-3 p-3 bg-light rounded-3" style="font-size:0.85rem;">
                <div class="row g-2">
                  <div class="col-6">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Buyer Name</span>
                    <span class="fw-semibold text-dark">{{ p.buyer_name || 'N/A' }}</span>
                  </div>
                  <div class="col-6">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Style / Order</span>
                    <span class="fw-semibold text-dark">{{ p.style_no || 'N/A' }} <small class="text-muted">({{ p.order_no || 'N/A' }})</small></span>
                  </div>
                  <div class="col-6 mt-2">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Color</span>
                    <span class="fw-semibold text-dark">{{ p.color || 'N/A' }}</span>
                  </div>
                  <div class="col-6 mt-2">
                    <span class="text-muted d-block" style="font-size: 0.72rem; text-transform:uppercase; font-weight:600;">Method & Supplier</span>
                    <span class="fw-semibold text-dark">{{ p.packing_method || 'N/A' }} <small class="text-muted">/ {{ p.carton_supplier || 'N/A' }}</small></span>
                  </div>
                </div>
              </div>

              <!-- Dates Info -->
              <div class="mb-3 px-3 py-2 bg-light rounded d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                  <i class="bi bi-calendar-event text-muted me-2"></i>
                  <span style="font-size: 0.8rem;" class="fw-medium">Start: {{ p.start_date | date:'mediumDate' }}</span>
                </div>
                <i class="bi bi-arrow-right text-muted mx-2"></i>
                <div class="d-flex align-items-center">
                  <span style="font-size: 0.8rem;" class="fw-medium text-danger">Ship: {{ p.expected_shipment_date | date:'mediumDate' }}</span>
                </div>
              </div>

              <!-- Live Production Sums -->
              <div class="row g-2 text-center p-2 rounded border mb-3" style="background: #fafafa;">
                <div class="col-6 border-end">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Planned Order / Cartons</span>
                  <span class="fw-semibold text-dark">{{ p.total_order_qty || 0 }} <small class="text-muted">pcs ({{ p.total_planned_cartons || 0 }} ctns)</small></span>
                </div>
                <div class="col-6">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Pcs Per Carton</span>
                  <span class="fw-semibold text-dark">{{ p.pcs_per_carton || 0 }} pcs</span>
                </div>
                <div class="col-4 border-end border-top pt-2">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Total Packed</span>
                  <span class="fw-bold fs-6 text-success">{{ p.total_packed_qty || 0 }}</span>
                </div>
                <div class="col-4 border-end border-top pt-2">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Cartons Ready</span>
                  <span class="fw-bold fs-6 text-dark">{{ p.total_packed_cartons || 0 }}</span>
                </div>
                <div class="col-4 border-top pt-2">
                  <span class="text-muted d-block mb-1" style="font-size: 0.7rem;">Rejections</span>
                  <span class="fw-bold fs-6 text-danger">{{ p.rejection_qty || 0 }}</span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-end mb-1">
                  <span class="text-muted fw-semibold" style="font-size: 0.75rem;">Packing Progress</span>
                  <span class="fw-bold" style="font-size: 0.85rem;" [ngClass]="{
                    'text-success': getCompletion(p) >= 100,
                    'text-primary': getCompletion(p) >= 50 && getCompletion(p) < 100,
                    'text-warning': getCompletion(p) < 50
                  }">{{ getCompletion(p) }}%</span>
                </div>
                <div class="progress" style="height: 8px; border-radius: 4px;">
                  <div class="progress-bar" 
                       [ngClass]="{
                         'bg-success': getCompletion(p) >= 100,
                         'bg-primary': getCompletion(p) >= 50 && getCompletion(p) < 100,
                         'bg-warning': getCompletion(p) < 50
                       }" 
                       role="progressbar" 
                       [style.width.%]="getCompletion(p)" 
                       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
              </div>

              <!-- Commercial Invoice Unlock -->
              <div class="mt-3">
                <button *ngIf="p.status === 'Ready to Ship' || p.status === 'Completed'" 
                        class="btn btn-sm btn-outline-success w-100 py-2 fw-bold"
                        (click)="openInvoiceModal(p)">
                  <i class="bi bi-file-earmark-ruled me-1"></i> Generate Packing List & Invoice
                </button>
                <div *ngIf="p.status !== 'Ready to Ship' && p.status !== 'Completed'" 
                     class="text-center py-2 px-3 border border-dashed text-muted rounded bg-light"
                     style="font-size:0.78rem;">
                  <i class="bi bi-lock-fill me-1"></i> Packing list & Invoice unlocks upon completion
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Commercial Document Modal Overlay -->
    <div class="modal fade show d-block" tabindex="-1" *ngIf="activeInvoicePlan" style="background: rgba(0,0,0,0.5); overflow-y: auto;">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius:12px;">
          <div class="modal-header border-0 pb-0 justify-content-end p-3">
            <button type="button" class="btn-close" (click)="closeInvoiceModal()"></button>
          </div>
          <div class="modal-body px-4 pb-4 pt-0">
            <!-- Commercial Invoice Body -->
            <div class="p-4 border rounded bg-white shadow-sm" id="print-area">
              <div class="d-flex justify-content-between align-items-start border-bottom pb-3 mb-4">
                <div>
                  <h4 class="text-primary fw-bold mb-0">COMMERCIAL INVOICE</h4>
                  <small class="text-muted">Garment Management System ERP</small>
                </div>
                <div class="text-end">
                  <div class="fw-bold text-dark">Invoice No: INV-{{ activeInvoicePlan.packing_plan_id || 'PKG-' + activeInvoicePlan.id }}</div>
                  <div class="text-muted small">Date: {{ todayDate | date:'mediumDate' }}</div>
                </div>
              </div>

              <!-- Sender / Receiver Details -->
              <div class="row mb-4">
                <div class="col-6">
                  <span class="text-muted small d-block uppercase fw-bold" style="font-size:0.7rem;">Shipper / Exporter:</span>
                  <div class="fw-semibold text-dark">Garments Management Exporters Ltd</div>
                  <div class="text-muted small">Plot 24-28, Sector 4, CEPZ<br>Chittagong, Bangladesh</div>
                </div>
                <div class="col-6">
                  <span class="text-muted small d-block uppercase fw-bold" style="font-size:0.7rem;">Buyer / Consignee:</span>
                  <div class="fw-semibold text-dark">{{ activeInvoicePlan.buyer_name || 'N/A' }}</div>
                  <div class="text-muted small">Order Reference: {{ activeInvoicePlan.order_no || 'N/A' }}</div>
                </div>
              </div>

              <!-- Cargo & Shipping Info -->
              <div class="table-responsive mb-4">
                <table class="table table-bordered table-sm text-sm mb-0">
                  <thead class="bg-light text-dark">
                    <tr>
                      <th>Style No</th>
                      <th>Color</th>
                      <th class="text-center">Total Quantity (pcs)</th>
                      <th class="text-center">Total Cartons</th>
                      <th class="text-center">Gross Weight</th>
                      <th class="text-center">Commercial Value (Est)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{{ activeInvoicePlan.style_no }}</td>
                      <td>{{ activeInvoicePlan.color || 'N/A' }}</td>
                      <td class="text-center fw-bold">{{ activeInvoicePlan.total_packed_qty }} pcs</td>
                      <td class="text-center">{{ activeInvoicePlan.total_packed_cartons }} ctns</td>
                      <td class="text-center">{{ (activeInvoicePlan.total_packed_qty * 0.22) + (activeInvoicePlan.total_packed_cartons * 1.5) | number:'1.1-1' }} kg</td>
                      <td class="text-center fw-bold text-success">$ {{ activeInvoicePlan.total_packed_qty * 4.5 | number:'1.2-2' }} USD</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Shipping Info -->
              <div class="p-3 bg-light rounded-3 mb-4" style="font-size: 0.85rem;">
                <div class="row g-2">
                  <div class="col-4">
                    <span class="text-muted d-block">Method:</span>
                    <strong class="text-dark">{{ activeInvoicePlan.packing_method }}</strong>
                  </div>
                  <div class="col-4">
                    <span class="text-muted d-block">Carton Supplier:</span>
                    <strong class="text-dark">{{ activeInvoicePlan.carton_supplier }}</strong>
                  </div>
                  <div class="col-4">
                    <span class="text-muted d-block">Supervisor:</span>
                    <strong class="text-dark">{{ activeInvoicePlan.packing_supervisor }}</strong>
                  </div>
                </div>
              </div>

              <!-- Invoice Footer Signature -->
              <div class="d-flex justify-content-between align-items-end pt-4 border-top">
                <div>
                  <small class="text-muted d-block">Authorized Commercial Signature</small>
                  <div class="mt-4" style="border-top:1px solid #ddd; width:180px;"></div>
                </div>
                <div class="text-end">
                  <span class="badge bg-success-subtle text-success border px-3 py-2 fs-6">RELEASE TO SHIP</span>
                </div>
              </div>
            </div>

            <!-- Print Actions -->
            <div class="d-flex justify-content-end gap-2 mt-3">
              <button class="btn btn-secondary" (click)="closeInvoiceModal()"><i class="bi bi-x-circle me-1"></i> Close</button>
              <button class="btn btn-primary" (click)="printDocument()"><i class="bi bi-printer me-1"></i> Print / Save PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plan-card {
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.75rem 1.5rem rgba(124, 58, 237, 0.12) !important;
    }
  `]
})
export class ViewPackingPlanComponent implements OnInit {
  private svc = inject(ProductionPlanningService);

  plans: any[] = [];
  activeInvoicePlan: any = null;
  todayDate: Date = new Date();

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans: this.svc.getPackingPlans(),
      daily: this.svc.getDayWisePackingProduction()
    }).subscribe({
      next: ({ plans, daily }) => {
        this.plans = plans.map((plan: any) => {
          const pId = plan.packing_plan_id ?? plan.id;
          const matching = daily.filter((d: any) => (d.packing_plan_id === pId || d.plan_id === pId));
          const totalPacked = matching.reduce((sum, d) => sum + (Number(d.today_packed_qty) || 0), 0);
          const totalCartons = matching.reduce((sum, d) => sum + (Number(d.today_packed_cartons) || 0), 0);
          const totalReject = matching.reduce((sum, d) => sum + (Number(d.today_reject_qty) || 0), 0);

          return {
            ...plan,
            total_packed_qty: totalPacked,
            total_packed_cartons: totalCartons,
            rejection_qty: totalReject
          };
        });
      }
    });
  }

  getCompletion(plan: any): number {
    const target = Number(plan.total_order_qty) || 1;
    const actual = Number(plan.total_packed_qty) || 0;
    const eff = Math.round((actual / target) * 100);
    return eff > 100 ? 100 : eff;
  }

  openInvoiceModal(plan: any) {
    this.activeInvoicePlan = plan;
  }

  closeInvoiceModal() {
    this.activeInvoicePlan = null;
  }

  printDocument() {
    window.print();
  }
}
