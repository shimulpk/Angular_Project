import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-day-wise-finishing-production',
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
                <h5 class="mb-0 text-white fw-bold">Day Wise Finishing Production</h5>
                <small class="text-white-50">Daily finishing audit log — review, edit or correct entries</small>
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
                     placeholder="e.g. FP-..."
                     [(ngModel)]="searchPlanId"
                     (ngModelChange)="applyFilter()">
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1">
                <i class="bi bi-palette me-1"></i>Filter by Style
              </label>
              <input type="text" class="form-control form-control-sm bg-light"
                     placeholder="e.g. NK201"
                     [(ngModel)]="searchStyle"
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
          No daily finishing entries yet. Use <strong>Add Day Wise Finishing Production</strong>.
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
                <tr style="background:linear-gradient(135deg,#f8faff,#f3e8ff);">
                  <th class="py-3 ps-4 th-style">#</th>
                  <th class="py-3 th-style">Date (তারিখ)</th>
                  <th class="py-3 th-style">Finishing Plan ID</th>
                  <th class="py-3 th-style">Style / Buyer</th>
                  <th class="py-3 th-style text-center">Today's Pass (পাস)</th>
                  <th class="py-3 th-style text-center">Today's Reject (রিজেক্ট)</th>
                  <th class="py-3 th-style">Remarks</th>
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
                            style="background:#f3e8ff;color:#7c3aed;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        <i class="bi bi-stars me-1"></i>
                        {{ rec.finishing_plan_id || rec.plan_id || '—' }}
                      </span>
                    </td>
                    <td class="py-3">
                      <div class="fw-semibold small">{{ rec.style_no || '—' }}</div>
                      <div class="text-muted" style="font-size:0.75rem;">{{ rec.buyer_name || '' }}</div>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold text-success" style="font-size:1rem;">
                        {{ rec.pass_qty | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold"
                            [ngClass]="rec.reject_qty > 0 ? 'text-danger' : 'text-muted'"
                            style="font-size:1rem;">
                        {{ rec.reject_qty | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
                    </td>
                    <td class="py-3">
                      <span class="text-muted small" style="max-width:180px; display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"
                            [title]="rec.remarks">{{ rec.remarks || '—' }}</span>
                    </td>
                    <td class="py-3 text-center">
                      <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary px-3"
                                (click)="startEdit(rec)"
                                title="Edit this entry">
                          <i class="bi bi-pencil me-1"></i>Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger px-3"
                                (click)="deleteRecord(rec)"
                                [disabled]="deletingId === rec.id"
                                title="Delete this entry">
                          <span *ngIf="deletingId === rec.id"
                                class="spinner-border spinner-border-sm me-1"></span>
                          <i *ngIf="deletingId !== rec.id" class="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Inline Edit Row -->
                  <tr *ngIf="editingId === rec.id"
                      style="background:#fefce8; border-left:3px solid #f59e0b;">
                    <td class="ps-4 py-3 text-muted small">{{ i + 1 }}</td>
                    <td class="py-2">
                      <input type="date" class="form-control form-control-sm"
                             style="min-width:130px;"
                             [(ngModel)]="editForm.date">
                    </td>
                    <td class="py-2">
                      <span class="badge fw-semibold"
                            style="background:#f3e8ff;color:#7c3aed;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        {{ rec.finishing_plan_id || rec.plan_id }}
                      </span>
                    </td>
                    <td class="py-2">
                      <div class="small fw-semibold">{{ rec.style_no || '—' }}</div>
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center"
                             style="max-width:110px; margin:0 auto;"
                             [(ngModel)]="editForm.pass_qty"
                             min="0" placeholder="Pass Qty">
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center"
                             style="max-width:90px; margin:0 auto;"
                             [(ngModel)]="editForm.reject_qty"
                             min="0" placeholder="Reject Qty">
                    </td>
                    <td class="py-2">
                      <input type="text" class="form-control form-control-sm"
                             [(ngModel)]="editForm.remarks"
                             placeholder="Remarks...">
                    </td>
                    <td class="py-2 text-center">
                      <div class="d-flex gap-2 justify-content-center">
                        <button class="btn btn-sm btn-success px-3"
                                (click)="saveEdit(rec)"
                                [disabled]="savingEdit">
                          <span *ngIf="savingEdit" class="spinner-border spinner-border-sm me-1"></span>
                          <i *ngIf="!savingEdit" class="bi bi-check2 me-1"></i>
                          Save
                        </button>
                        <button class="btn btn-sm btn-outline-secondary px-3"
                                (click)="cancelEdit()">
                          <i class="bi bi-x me-1"></i>Cancel
                        </button>
                      </div>
                    </td>
                  </tr>

                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Summary Footer -->
        <div class="card-footer border-0 py-3 px-4"
             style="background:linear-gradient(135deg,#f8faff,#f3e8ff);">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Entries</div>
              <div class="fw-bold text-primary fs-6">{{ filteredRecords.length }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Passed</div>
              <div class="fw-bold text-success fs-6">{{ getTotalPass() | number }} pcs</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Rejected</div>
              <div class="fw-bold text-danger fs-6">{{ getTotalReject() | number }} pcs</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Net Finished Pieces</div>
              <div class="fw-bold text-dark fs-6">
                {{ (getTotalPass() - getTotalReject()) | number }} pcs
              </div>
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
export class ViewDayWiseFinishingProductionComponent implements OnInit {
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  allRecords:      any[] = [];
  filteredRecords: any[] = [];
  finishingPlans:  any[] = [];
  loading     = false;
  deletingId: any = null;

  // Edit state
  editingId:  any    = null;
  savingEdit          = false;
  editForm: {
    date: string;
    pass_qty: number | null;
    reject_qty: number | null;
    remarks: string;
  } = { date: '', pass_qty: null, reject_qty: null, remarks: '' };

  // Filters
  searchPlanId = '';
  searchStyle  = '';
  searchDate   = '';

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    this.editingId = null;
    forkJoin({
      records: this.svc.getDayWiseFinishingProduction(),
      plans:   this.svc.getFinishingPlans()
    }).subscribe({
      next: ({ records, plans }) => {
        this.finishingPlans = plans;
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
    const style  = this.searchStyle.toLowerCase().trim();
    const date   = this.searchDate;

    this.filteredRecords = this.allRecords.filter(rec => {
      const planKey = (rec.finishing_plan_id || rec.plan_id || '').toLowerCase();
      const matchPlan  = !planId || planKey.includes(planId);
      const matchStyle = !style  || (rec.style_no || '').toLowerCase().includes(style);
      const matchDate  = !date   || rec.date === date;
      return matchPlan && matchStyle && matchDate;
    });
  }

  clearFilters() {
    this.searchPlanId = '';
    this.searchStyle  = '';
    this.searchDate   = '';
    this.applyFilter();
  }

  startEdit(rec: any) {
    this.editingId = rec.id;
    this.editForm  = {
      date:       rec.date || new Date().toISOString().substring(0, 10),
      pass_qty:   Number(rec.pass_qty) || 0,
      reject_qty: Number(rec.reject_qty) || 0,
      remarks:    rec.remarks || ''
    };
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(rec: any) {
    this.savingEdit = true;
    const updated = {
      ...rec,
      date:       this.editForm.date,
      pass_qty:   this.editForm.pass_qty,
      reject_qty: this.editForm.reject_qty,
      remarks:    this.editForm.remarks
    };

    this.svc.updateDayWiseFinishingProduction(rec.id, updated).subscribe({
      next: () => {
        this.notify.success('Daily finishing record updated.');
        this.editingId  = null;
        this.savingEdit = false;
        this.syncPlanData(rec.finishing_plan_id || rec.plan_id);
      },
      error: () => {
        this.notify.error('Failed to update record.');
        this.savingEdit = false;
      }
    });
  }

  deleteRecord(rec: any) {
    if (!confirm('Are you sure you want to delete this daily finishing entry?')) return;
    this.deletingId = rec.id;

    this.svc.deleteDayWiseFinishingProduction(rec.id).subscribe({
      next: () => {
        this.notify.success('Record deleted.');
        this.deletingId = null;
        this.syncPlanData(rec.finishing_plan_id || rec.plan_id);
      },
      error: () => {
        this.notify.error('Failed to delete record.');
        this.deletingId = null;
      }
    });
  }

  syncPlanData(planKey: string) {
    if (!planKey) { this.loadRecords(); return; }

    this.svc.getDayWiseFinishingProduction().subscribe(records => {
      this.allRecords = records.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const siblingRecords = this.allRecords.filter(
        r => (r.finishing_plan_id || r.plan_id) === planKey
      );
      const cumPass   = siblingRecords.reduce((sum, r) => sum + (Number(r.pass_qty) || 0), 0);
      const cumReject = siblingRecords.reduce((sum, r) => sum + (Number(r.reject_qty) || 0), 0);

      const plan = this.finishingPlans.find(
        p => (p.finishing_plan_id || p.id) === planKey
      );

      if (plan) {
        const target = Number(plan.target_qty) || 0;
        const willComplete = target > 0 && cumPass >= target;

        const updatedPlan = {
          ...plan,
          pass_qty:      cumPass,
          rejection_qty: cumReject,
          status: willComplete ? 'Completed' : 'In Finishing'
        };

        this.svc.updateFinishingPlan(plan.id, updatedPlan).subscribe({
          next: () => { this.loadRecords(); }
        });
      } else {
        this.loadRecords();
      }
    });
  }

  getTotalPass()   { return this.filteredRecords.reduce((s, r) => s + (Number(r.pass_qty)   || 0), 0); }
  getTotalReject() { return this.filteredRecords.reduce((s, r) => s + (Number(r.reject_qty) || 0), 0); }
}
