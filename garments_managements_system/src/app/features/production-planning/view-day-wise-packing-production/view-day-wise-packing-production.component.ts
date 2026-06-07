import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-day-wise-packing-production',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">

      <!-- Page Header -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:12px; overflow:hidden;">
        <div class="card-body py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
                <i class="bi bi-calendar3-week fs-4 text-white"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Day Wise Packing Production</h5>
                <small class="text-white-50">Daily packing output log — review, edit, or delete entries</small>
              </div>
            </div>
            <span class="badge px-3 py-2 fw-semibold"
                  style="background:rgba(255,255,255,0.2); font-size:0.85rem; border-radius:20px;">
              {{ filteredRecords.length }} Record{{ filteredRecords.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:12px;">
        <div class="card-body py-3 px-4">
          <div class="row g-3 align-items-end">

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1">
                <i class="bi bi-search me-1"></i>Search by Plan ID
              </label>
              <input type="text" class="form-control form-control-sm bg-light"
                     placeholder="e.g. PKG-..."
                     [(ngModel)]="searchPlanId"
                     (ngModelChange)="applyFilter()">
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1">
                <i class="bi bi-tag me-1"></i>Search by Style No
              </label>
              <input type="text" class="form-control form-control-sm bg-light"
                     placeholder="e.g. ST-..."
                     [(ngModel)]="searchStyleNo"
                     (ngModelChange)="applyFilter()">
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1">
                <i class="bi bi-calendar me-1"></i>Filter by Date
              </label>
              <input type="date" class="form-control form-control-sm bg-light"
                     [(ngModel)]="searchDate"
                     (ngModelChange)="applyFilter()">
            </div>

            <div class="col-md-3 d-flex gap-2 align-items-end">
              <button class="btn btn-sm btn-outline-secondary px-3" (click)="clearFilters()">
                <i class="bi bi-x-circle me-1"></i>Clear
              </button>
              <button class="btn btn-sm btn-outline-primary px-3" (click)="loadRecords()">
                <i class="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>

          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-3">Loading records...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && filteredRecords.length === 0"
           class="card border-0 shadow-sm text-center py-5" style="border-radius:12px;">
        <i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i>
        <h5 class="text-muted">No Records Found</h5>
        <p class="text-muted small mb-0" *ngIf="allRecords.length === 0">
          No daily packing entries yet. Use <strong>Add Day Wise Packing Production</strong>.
        </p>
        <p class="text-muted small mb-0" *ngIf="allRecords.length > 0">
          No records match your filters.
          <a href="javascript:void(0)" (click)="clearFilters()">Clear filters</a>
          to see all {{ allRecords.length }} record(s).
        </p>
      </div>

      <!-- Main Table -->
      <div *ngIf="!loading && filteredRecords.length > 0"
           class="card border-0 shadow-sm" style="border-radius:12px; overflow:hidden;">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr style="background:linear-gradient(135deg,#f8faff,#f3f0ff);">
                  <th class="py-3 ps-4 th-style">#</th>
                  <th class="py-3 th-style">Date</th>
                  <th class="py-3 th-style">Packing Plan ID</th>
                  <th class="py-3 th-style">Style No</th>
                  <th class="py-3 th-style text-center">Target Pcs</th>
                  <th class="py-3 th-style text-center">Today's Packed</th>
                  <th class="py-3 th-style text-center">Packed Cartons</th>
                  <th class="py-3 th-style text-center">Reject Qty</th>
                  <th class="py-3 th-style text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let rec of filteredRecords; let i = index">

                  <!-- View Row -->
                  <tr *ngIf="editingId !== rec.id" class="record-row">
                    <td class="ps-4 py-3 text-muted small">{{ i + 1 }}</td>
                    <td class="py-3">
                      <div class="fw-semibold" style="font-size:0.9rem;">
                        {{ rec.date | date:'dd/MM/yyyy' }}
                      </div>
                    </td>
                    <td class="py-3">
                      <span class="badge fw-semibold"
                            style="background:#f5f3ff;color:#7c3aed;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        <i class="bi bi-box-seam me-1"></i>
                        {{ rec.packing_plan_id || rec.plan_id || '—' }}
                      </span>
                    </td>
                    <td class="py-3">
                      <span class="badge bg-light text-dark border" style="font-size:0.8rem;">
                        {{ rec.style_no || '—' }}
                      </span>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-semibold text-primary" style="font-size:0.95rem;">
                        {{ getTargetPcs(rec) | number }}
                      </span>
                      <div class="text-muted" style="font-size:0.7rem;">pcs</div>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold text-success" style="font-size:1rem;">
                        {{ rec.today_packed_qty | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-semibold text-dark">{{ rec.today_packed_cartons || 0 }}</span>
                      <div class="text-muted" style="font-size:0.7rem;">ctns</div>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold" [ngClass]="rec.today_reject_qty > 0 ? 'text-danger' : 'text-muted'">
                        {{ rec.today_reject_qty | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
                    </td>
                    <td class="py-3 text-center">
                      <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary px-3" (click)="startEdit(rec)">
                          <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger px-3"
                                [disabled]="deletingId === rec.id"
                                (click)="deleteRecord(rec)">
                          <span *ngIf="deletingId === rec.id" class="spinner-border spinner-border-sm me-1"></span>
                          <i *ngIf="deletingId !== rec.id" class="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Inline Edit Row -->
                  <tr *ngIf="editingId === rec.id" style="background:#fffbeb; border-left:3px solid #f59e0b;">
                    <td class="ps-4 py-3 text-muted small">{{ i + 1 }}</td>
                    <td class="py-2">
                      <input type="date" class="form-control form-control-sm" [(ngModel)]="editForm.date">
                    </td>
                    <td class="py-2">
                      <span class="badge fw-semibold" style="background:#f5f3ff;color:#7c3aed;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        {{ rec.packing_plan_id || rec.plan_id || '—' }}
                      </span>
                    </td>
                    <td class="py-2">
                      <span class="badge bg-light text-dark border" style="font-size:0.8rem;">
                        {{ rec.style_no || '—' }}
                      </span>
                    </td>
                    <td class="py-2 text-center">
                      <span class="fw-semibold text-primary">{{ getTargetPcs(rec) | number }}</span>
                      <div class="text-muted" style="font-size:0.7rem;">pcs</div>
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center mx-auto"
                             style="max-width:110px;" [(ngModel)]="editForm.today_packed_qty" min="0">
                    </td>
                    <td class="py-2 text-center">
                      <span class="fw-semibold text-dark">{{ getCalculatedCartons(rec) }}</span>
                      <div class="text-muted" style="font-size:0.7rem;">ctns</div>
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center mx-auto"
                             style="max-width:90px;" [(ngModel)]="editForm.today_reject_qty" min="0">
                    </td>
                    <td class="py-2 text-center">
                      <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-success px-3" (click)="saveEdit(rec)" [disabled]="savingEdit">
                          <span *ngIf="savingEdit" class="spinner-border spinner-border-sm me-1"></span>
                          Save
                        </button>
                        <button class="btn btn-sm btn-outline-secondary px-3" (click)="cancelEdit()">Cancel</button>
                      </div>
                    </td>
                  </tr>

                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary Footer -->
        <div class="card-footer border-0 py-3 px-4" style="background:linear-gradient(135deg,#f8faff,#f3f0ff);">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Entries</div>
              <div class="fw-bold text-primary fs-6">{{ filteredRecords.length }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Packed</div>
              <div class="fw-bold text-success fs-6">{{ getTotalPacked() | number }} pcs</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Cartons</div>
              <div class="fw-bold text-dark fs-6">{{ getTotalCartons() | number }} ctns</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Rejected</div>
              <div class="fw-bold text-danger fs-6">{{ getTotalReject() | number }} pcs</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .th-style {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      white-space: nowrap;
    }
    .record-row { transition: background 0.15s ease; }
    .record-row:hover { background: rgba(124,58,237,0.03) !important; }
  `]
})
export class ViewDayWisePackingProductionComponent implements OnInit {
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private notify = inject(NotificationService);

  allRecords: any[] = [];
  filteredRecords: any[] = [];
  packingPlans: any[] = [];
  loading = false;
  deletingId: any = null;

  editingId: any = null;
  savingEdit = false;
  editForm = {
    date: '',
    today_packed_qty: 0,
    today_reject_qty: 0
  };

  searchPlanId = '';
  searchStyleNo = '';
  searchDate = '';

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    this.editingId = null;
    forkJoin({
      records: this.svc.getDayWisePackingProduction(),
      plans: this.svc.getPackingPlans()
    }).subscribe({
      next: ({ records, plans }) => {
        this.packingPlans = plans;
        this.allRecords = records.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyFilter() {
    const planId = this.searchPlanId.toLowerCase().trim();
    const styleNo = this.searchStyleNo.toLowerCase().trim();
    const date = this.searchDate;

    this.filteredRecords = this.allRecords.filter(rec => {
      const planKey = (rec.packing_plan_id || rec.plan_id || '').toLowerCase();
      const matchPlan = !planId || planKey.includes(planId);
      const matchStyle = !styleNo || (rec.style_no || '').toLowerCase().includes(styleNo);
      const matchDate = !date || rec.date === date;
      return matchPlan && matchStyle && matchDate;
    });
  }

  clearFilters() {
    this.searchPlanId = '';
    this.searchStyleNo = '';
    this.searchDate = '';
    this.applyFilter();
  }

  getTargetPcs(rec: any): number {
    const planKey = rec.packing_plan_id || rec.plan_id;
    const plan = this.packingPlans.find(p => (p.packing_plan_id ?? p.id) === planKey);
    return Number(plan?.total_order_qty) || 0;
  }

  getCalculatedCartons(rec: any): number {
    const planKey = rec.packing_plan_id || rec.plan_id;
    const plan = this.packingPlans.find(p => (p.packing_plan_id ?? p.id) === planKey);
    const perCarton = Number(plan?.pcs_per_carton) || 1;
    const qty = this.editingId === rec.id ? this.editForm.today_packed_qty : rec.today_packed_qty;
    return Math.ceil((Number(qty) || 0) / perCarton);
  }

  startEdit(rec: any) {
    this.editingId = rec.id;
    this.editForm = {
      date: rec.date || new Date().toISOString().substring(0, 10),
      today_packed_qty: Number(rec.today_packed_qty) || 0,
      today_reject_qty: Number(rec.today_reject_qty) || 0
    };
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(rec: any) {
    this.savingEdit = true;
    const planKey = rec.packing_plan_id || rec.plan_id;
    const plan = this.packingPlans.find(p => (p.packing_plan_id ?? p.id) === planKey);
    const perCarton = Number(plan?.pcs_per_carton) || 1;
    const newCartons = Math.ceil(this.editForm.today_packed_qty / perCarton);

    const updated = {
      ...rec,
      date: this.editForm.date,
      today_packed_qty: this.editForm.today_packed_qty,
      today_packed_cartons: newCartons,
      today_reject_qty: this.editForm.today_reject_qty
    };

    this.svc.updateDayWisePackingProduction(rec.id, updated).subscribe({
      next: () => {
        this.notify.success('Packing production log updated.');
        this.editingId = null;
        this.savingEdit = false;
        this.checkAndUpdatePlanStatus(planKey);
        this.loadRecords();
      },
      error: () => {
        this.notify.error('Failed to update record.');
        this.savingEdit = false;
      }
    });
  }

  deleteRecord(rec: any) {
    if (!confirm('Are you sure you want to delete this packing entry?')) return;
    this.deletingId = rec.id;

    this.svc.deleteDayWisePackingProduction(rec.id).subscribe({
      next: () => {
        this.notify.success('Record deleted.');
        const planKey = rec.packing_plan_id || rec.plan_id;
        this.deletingId = null;
        this.checkAndUpdatePlanStatus(planKey);
        this.loadRecords();
      },
      error: () => {
        this.notify.error('Failed to delete record.');
        this.deletingId = null;
      }
    });
  }

  checkAndUpdatePlanStatus(planKey: string) {
    if (!planKey) return;
    const plan = this.packingPlans.find(p => (p.packing_plan_id ?? p.id) === planKey);
    if (!plan) return;

    // fetch all logs for this plan directly
    this.svc.getDayWisePackingProduction().subscribe(records => {
      const matching = records.filter(r => (r.packing_plan_id === planKey || r.plan_id === planKey));
      const totalPacked = matching.reduce((sum, r) => sum + (Number(r.today_packed_qty) || 0), 0);
      const target = Number(plan.total_order_qty) || 0;
      const completed = target > 0 && totalPacked >= target;

      const newStatus = completed ? 'Ready to Ship' : 'In Packing';
      if (plan.status !== newStatus) {
        this.svc.updatePackingPlan(plan.id, { ...plan, status: newStatus }).subscribe(() => {
          this.notify.info(`Main packing plan status updated to: ${newStatus}`);
          // also update order status
          this.orderSvc.getOrders().subscribe(orders => {
            const matchedOrder = orders.find(o => (o.poNumber === plan.order_no || o.orderId === plan.order_no || o.id === plan.order_no));
            if (matchedOrder && matchedOrder.status !== newStatus) {
              this.orderSvc.updateOrder(matchedOrder.id, { ...matchedOrder, status: newStatus }).subscribe();
            }
          });
        });
      }
    });
  }

  getTotalPacked() {
    return this.filteredRecords.reduce((s, r) => s + (Number(r.today_packed_qty) || 0), 0);
  }

  getTotalCartons() {
    return this.filteredRecords.reduce((s, r) => s + (Number(r.today_packed_cartons) || 0), 0);
  }

  getTotalReject() {
    return this.filteredRecords.reduce((s, r) => s + (Number(r.today_reject_qty) || 0), 0);
  }
}
