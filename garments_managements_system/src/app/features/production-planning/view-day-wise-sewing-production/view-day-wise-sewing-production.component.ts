import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-view-day-wise-sewing-production',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">

      <!-- Page Header -->
      <div class="card border-0 shadow-sm mb-4" style="border-radius:12px; overflow:hidden;">
        <div class="card-body py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3"
                   style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
                <i class="bi bi-calendar3-week fs-4 text-white"></i>
              </div>
              <div>
                <h5 class="mb-0 text-white fw-bold">Day Wise Sewing Production</h5>
                <small class="text-white-50">Daily sewing output log — review, edit, or delete entries</small>
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
                     placeholder="e.g. SP-..."
                     [(ngModel)]="searchPlanId"
                     (ngModelChange)="applyFilter()">
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-muted mb-1">
                <i class="bi bi-tag me-1"></i>Filter by Line
              </label>
              <input type="text" class="form-control form-control-sm bg-light"
                     placeholder="e.g. Line 1"
                     [(ngModel)]="searchLineNo"
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
          No daily sewing entries yet. Use <strong>Add Day Wise Sewing Production</strong>.
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
                <tr style="background:linear-gradient(135deg,#f8faff,#eef2ff);">
                  <th class="py-3 ps-4 th-style">#</th>
                  <th class="py-3 th-style">Date (তারিখ)</th>
                  <th class="py-3 th-style">Sewing Plan ID</th>
                  <th class="py-3 th-style">Line</th>
                  <th class="py-3 th-style text-center">Today's Achieved (আজ হয়েছে)</th>
                  <th class="py-3 th-style text-center">Today's Reject</th>
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
                            style="background:#eff6ff;color:#1d4ed8;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        <i class="bi bi-layers me-1"></i>
                        {{ rec.sewing_plan_id || rec.plan_id || '—' }}
                      </span>
                    </td>
                    <td class="py-3 fw-semibold">
                      {{ rec.line_no || '—' }}
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold text-success" style="font-size:1rem;">
                        {{ rec.achieved_quantity | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
                    </td>
                    <td class="py-3 text-center">
                      <span class="fw-bold"
                            [ngClass]="rec.rejection_qty > 0 ? 'text-danger' : 'text-muted'"
                            style="font-size:1rem;">
                        {{ rec.rejection_qty | number }}
                      </span>
                      <span class="text-muted small ms-1">pcs</span>
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
                      style="background:#fffbeb; border-left:3px solid #f59e0b;">
                    <td class="ps-4 py-3 text-muted small">{{ i + 1 }}</td>
                    <td class="py-2">
                      <input type="date" class="form-control form-control-sm"
                             style="min-width:130px;"
                             [(ngModel)]="editForm.date">
                    </td>
                    <td class="py-2">
                      <span class="badge fw-semibold"
                            style="background:#eff6ff;color:#1d4ed8;font-size:0.8rem;padding:5px 10px;border-radius:20px;">
                        {{ rec.sewing_plan_id || rec.plan_id }}
                      </span>
                    </td>
                    <td class="py-2">
                      <select class="form-select form-select-sm" [(ngModel)]="editForm.line_no">
                        <option *ngFor="let l of getPlanLines(rec)" [value]="l.line_no">
                          {{ l.line_no }}
                        </option>
                      </select>
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center"
                             style="max-width:110px; margin:0 auto;"
                             [(ngModel)]="editForm.achieved_quantity"
                             min="0" placeholder="e.g. 800">
                    </td>
                    <td class="py-2 text-center">
                      <input type="number" class="form-control form-control-sm text-center"
                             style="max-width:90px; margin:0 auto;"
                             [(ngModel)]="editForm.rejection_qty"
                             min="0" placeholder="e.g. 5">
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
             style="background:linear-gradient(135deg,#f8faff,#eef2ff);">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Entries</div>
              <div class="fw-bold text-primary fs-6">{{ filteredRecords.length }}</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Achieved</div>
              <div class="fw-bold text-success fs-6">{{ getTotalAchieved() | number }} pcs</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Total Rejected</div>
              <div class="fw-bold text-danger fs-6">{{ getTotalReject() | number }} pcs</div>
            </div>
            <div class="col-6 col-md-3">
              <div class="text-muted small fw-semibold">Net Output Pieces</div>
              <div class="fw-bold text-dark fs-6">
                {{ (getTotalAchieved() - getTotalReject()) | number }} pcs
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
    .record-row:hover { background: rgba(37,99,235,0.03) !important; }
  `]
})
export class ViewDayWiseSewingProductionComponent implements OnInit {
  private svc    = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  allRecords:      any[] = [];
  filteredRecords: any[] = [];
  sewingPlans:     any[] = [];
  loading     = false;
  deletingId: any = null;

  // Edit state
  editingId:  any    = null;
  savingEdit          = false;
  editForm: {
    date: string;
    line_no: string;
    achieved_quantity: number | null;
    rejection_qty: number | null;
  } = { date: '', line_no: '', achieved_quantity: null, rejection_qty: null };

  // Filters
  searchPlanId  = '';
  searchLineNo = '';
  searchDate    = '';

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.loading = true;
    this.editingId = null;
    forkJoin({
      records: this.svc.getDayWiseSewingProduction(),
      plans:   this.svc.getSewingPlans()
    }).subscribe({
      next: ({ records, plans }) => {
        this.sewingPlans  = plans;
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
    const lineNo = this.searchLineNo.toLowerCase().trim();
    const date   = this.searchDate;

    this.filteredRecords = this.allRecords.filter(rec => {
      const planKey = (rec.sewing_plan_id || rec.plan_id || '').toLowerCase();
      const matchPlan = !planId || planKey.includes(planId);
      const matchLine = !lineNo || (rec.line_no || '').toLowerCase().includes(lineNo);
      const matchDate = !date || rec.date === date;
      return matchPlan && matchLine && matchDate;
    });
  }

  clearFilters() {
    this.searchPlanId = '';
    this.searchLineNo = '';
    this.searchDate   = '';
    this.applyFilter();
  }

  getPlanLines(rec: any): any[] {
    const planKey = rec.sewing_plan_id || rec.plan_id;
    const plan = this.sewingPlans.find(p => (p.sewing_plan_id || p.id) === planKey);
    return plan ? (plan.targets || []) : [];
  }

  // Edit logic
  startEdit(rec: any) {
    this.editingId = rec.id;
    this.editForm  = {
      date:              rec.date || new Date().toISOString().substring(0, 10),
      line_no:           rec.line_no || '',
      achieved_quantity: Number(rec.achieved_quantity) || 0,
      rejection_qty:     Number(rec.rejection_qty) || 0
    };
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(rec: any) {
    this.savingEdit = true;
    const updated = {
      ...rec,
      date:              this.editForm.date,
      line_no:           this.editForm.line_no,
      achieved_quantity: this.editForm.achieved_quantity,
      rejection_qty:     this.editForm.rejection_qty
    };

    this.svc.updateDayWiseSewingProduction(rec.id, updated).subscribe({
      next: () => {
        this.notify.success('Daily sewing record updated.');
        this.editingId  = null;
        this.savingEdit = false;
        
        // Sync sewing plan values
        this.syncPlanData(rec.sewing_plan_id || rec.plan_id);
      },
      error: () => {
        this.notify.error('Failed to update record.');
        this.savingEdit = false;
      }
    });
  }

  deleteRecord(rec: any) {
    if (!confirm('Are you sure you want to delete this daily sewing entry?')) return;
    this.deletingId = rec.id;

    this.svc.deleteDayWiseSewingProduction(rec.id).subscribe({
      next: () => {
        this.notify.success('Record deleted.');
        this.deletingId = null;
        this.syncPlanData(rec.sewing_plan_id || rec.plan_id);
      },
      error: () => {
        this.notify.error('Failed to delete record.');
        this.deletingId = null;
      }
    });
  }

  syncPlanData(planKey: string) {
    if (!planKey) { this.loadRecords(); return; }
    
    // Fetch all fresh daily production records
    this.svc.getDayWiseSewingProduction().subscribe(records => {
      this.allRecords = records.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const siblingRecords = this.allRecords.filter(r => (r.sewing_plan_id || r.plan_id) === planKey);
      const cumAchieved = siblingRecords.reduce((sum, r) => sum + (Number(r.achieved_quantity) || 0), 0);
      const cumReject = siblingRecords.reduce((sum, r) => sum + (Number(r.rejection_qty) || 0), 0);

      const plan = this.sewingPlans.find(p => (p.sewing_plan_id || p.id) === planKey);
      if (plan) {
        const target = Number(plan.input_received_qty) || 0;
        const willComplete = target > 0 && cumAchieved >= target;

        const updatedPlan = {
          ...plan,
          output_qty: cumAchieved,
          rejection_qty: cumReject,
          status: willComplete ? 'Completed' : 'In Sewing'
        };

        this.svc.updateSewingPlan(plan.id, updatedPlan).subscribe({
          next: () => {
            this.loadRecords();
          }
        });
      } else {
        this.loadRecords();
      }
    });
  }

  // Footer totals
  getTotalAchieved() {
    return this.filteredRecords.reduce((s, r) => s + (Number(r.achieved_quantity) || 0), 0);
  }
  getTotalReject() {
    return this.filteredRecords.reduce((s, r) => s + (Number(r.rejection_qty) || 0), 0);
  }
}
