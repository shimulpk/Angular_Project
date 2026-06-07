import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-day-wise-packing-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">
        <!-- Header -->
        <div class="card-header border-0 py-4 px-4"
             style="background:linear-gradient(135deg,#1e3a5f 0%,#7c3aed 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-calendar-plus fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Day Wise Packing Production</h5>
              <small class="text-white-50">Log actual daily packed quantities, rejects and carton progress</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Plan Reference -->
            <div class="section-label mb-3">
              <i class="bi bi-bookmark-check me-1"></i>Packing Plan Selection
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="date" [class.is-invalid]="isInvalid('date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>
              <div class="col-md-8">
                <label class="form-label fw-semibold">Select Packing Plan <span class="text-danger">*</span>
                  <small class="text-muted fw-normal ms-1">(Only Active 'In Packing' plans shown)</small>
                </label>
                <select class="form-select" formControlName="packing_plan_id" (change)="onPlanChange($event)"
                        [class.is-invalid]="isInvalid('packing_plan_id')">
                  <option value="">— Select Active Packing Plan —</option>
                  <option *ngFor="let plan of activePlans" [value]="plan.packing_plan_id ?? plan.id">
                    {{ plan.packing_plan_id ?? plan.id }}
                    {{ plan.style_no ? ' · Style: ' + plan.style_no : '' }}
                    {{ plan.color ? ' · ' + plan.color : '' }}
                    {{ plan.total_order_qty ? ' · Target: ' + plan.total_order_qty + ' pcs' : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Packing Plan reference is required.</div>
                <div *ngIf="activePlans.length === 0" class="text-warning small mt-1">
                  <i class="bi bi-exclamation-triangle me-1"></i>No active "In Packing" plans found.
                </div>
              </div>
            </div>

            <!-- Active Plan Info Alert -->
            <div *ngIf="selectedPlan" class="alert py-3 mb-4 rounded-3 animate-fade-in"
                 style="background:#f5f3ff; border:1px solid #ddd6fe;">
              <div class="row g-2 text-center">
                <div class="col-6 col-md-3">
                  <div class="text-muted small uppercase fw-bold" style="font-size:0.7rem;">Target Qty</div>
                  <div class="fw-bold text-dark">{{ selectedPlan.total_order_qty | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted small uppercase fw-bold" style="font-size:0.7rem;">Pcs / Carton</div>
                  <div class="fw-bold text-dark">{{ selectedPlan.pcs_per_carton || 1 }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted small uppercase fw-bold" style="font-size:0.7rem;">Packed So Far</div>
                  <div class="fw-bold text-success">{{ previousPackedTotal | number }} pcs</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="text-muted small uppercase fw-bold" style="font-size:0.7rem;">Remaining</div>
                  <div class="fw-bold text-danger">{{ remainingQty | number }} pcs</div>
                </div>
              </div>
            </div>

            <!-- Section 2: Production Inputs -->
            <div class="section-label mb-3">
              <i class="bi bi-input-cursor-text me-1"></i>Today's Production Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Today's Packed Qty (pcs) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="today_packed_qty" min="0"
                       (input)="onQtyInput()"
                       [class.is-invalid]="isInvalid('today_packed_qty')" placeholder="e.g. 1000">
                <div class="invalid-feedback">Packed quantity must be 0 or more.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Today's Packed Cartons (Auto)</label>
                <input type="number" class="form-control bg-light" formControlName="today_packed_cartons" readonly
                       placeholder="Auto-calculated">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Today's Reject Qty (pcs) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="today_reject_qty" min="0"
                       [class.is-invalid]="isInvalid('today_reject_qty')" placeholder="e.g. 5">
                <div class="invalid-feedback">Reject quantity must be 0 or more.</div>
              </div>
            </div>

            <!-- Process Alert -->
            <div class="alert alert-warning py-2 mb-4 d-flex align-items-center gap-2" style="font-size: 0.85rem; border-radius: 8px;">
              <i class="bi bi-lightning-fill text-warning"></i>
              <div>
                <strong>Final Closure Automation:</strong> Reaching target quantity changes plan & order status to 
                <span class="badge bg-success">Ready to Ship</span>, adds records to finished goods inventory (FG Stock), 
                and unlocks invoice generation.
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-5" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  Save Production
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6c757d;
      border-left: 3px solid #7c3aed;
      padding-left: 8px;
      margin-top: 4px;
    }
  `]
})
export class AddDayWisePackingProductionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private notify = inject(NotificationService);

  activePlans: any[] = [];
  allDailyRecords: any[] = [];
  selectedPlan: any = null;
  previousPackedTotal = 0;
  remainingQty = 0;
  submitting = false;

  form: FormGroup = this.fb.group({
    date:                 [new Date().toISOString().substring(0, 10), Validators.required],
    packing_plan_id:      ['', Validators.required],
    today_packed_qty:     [null, [Validators.required, Validators.min(0)]],
    today_packed_cartons: [null],
    today_reject_qty:     [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      plans: this.svc.getPackingPlans(),
      daily: this.svc.getDayWisePackingProduction()
    }).subscribe({
      next: ({ plans, daily }) => {
        this.activePlans = plans.filter((p: any) => p.status === 'In Packing' || p.status === 'Pending' || p.status === 'In Progress');
        this.allDailyRecords = daily;
      }
    });
  }

  onPlanChange(event: any) {
    const planId = event.target.value;
    this.selectedPlan = this.activePlans.find(
      p => (p.packing_plan_id ?? p.id) === planId
    ) || null;

    if (this.selectedPlan) {
      const pId = this.selectedPlan.packing_plan_id ?? this.selectedPlan.id;
      const matching = this.allDailyRecords.filter(r => (r.packing_plan_id === pId || r.plan_id === pId));
      this.previousPackedTotal = matching.reduce((sum, r) => sum + (Number(r.today_packed_qty) || 0), 0);
      this.remainingQty = Math.max(0, (Number(this.selectedPlan.total_order_qty) || 0) - this.previousPackedTotal);
      this.onQtyInput();
    } else {
      this.previousPackedTotal = 0;
      this.remainingQty = 0;
      this.form.patchValue({ today_packed_cartons: null });
    }
  }

  onQtyInput() {
    if (!this.selectedPlan) return;
    const qty = Number(this.form.get('today_packed_qty')?.value) || 0;
    const perCarton = Number(this.selectedPlan.pcs_per_carton) || 1;
    this.form.patchValue({
      today_packed_cartons: Math.ceil(qty / perCarton)
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      date: new Date().toISOString().substring(0, 10),
      today_reject_qty: 0
    });
    this.selectedPlan = null;
    this.previousPackedTotal = 0;
    this.remainingQty = 0;
    this.loadData();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    const val = this.form.value;
    const planId = val.packing_plan_id;
    const qty = Number(val.today_packed_qty) || 0;
    const cartons = Number(val.today_packed_cartons) || 0;
    const totalPacked = this.previousPackedTotal + qty;
    const target = Number(this.selectedPlan?.total_order_qty) || 0;
    const willComplete = target > 0 && totalPacked >= target;

    const dailyRecord = {
      packing_plan_id: planId,
      plan_id: planId,
      date: val.date,
      today_packed_qty: qty,
      today_packed_cartons: cartons,
      today_reject_qty: Number(val.today_reject_qty) || 0,
      style_no: this.selectedPlan?.style_no || '',
      buyer_name: this.selectedPlan?.buyer_name || '',
      order_no: this.selectedPlan?.order_no || ''
    };

    // 1. Create the Day-wise entry
    this.svc.createDayWisePackingProduction(dailyRecord).pipe(
      switchMap(() => {
        if (willComplete && this.selectedPlan) {
          // Update Packing Plan status -> Completed / Ready to Ship
          const updatedPlan = { ...this.selectedPlan, status: 'Ready to Ship' };
          const planDbId = this.selectedPlan.id;

          // Update main buyer order if found
          const orderUpdate$ = this.orderSvc.getOrders().pipe(
            switchMap(orders => {
              const matchedOrder = orders.find(o => 
                (o.poNumber === this.selectedPlan.order_no || o.orderId === this.selectedPlan.order_no || o.id === this.selectedPlan.order_no)
              );
              if (matchedOrder) {
                const updatedOrder = { ...matchedOrder, status: 'Ready to Ship' };
                return this.orderSvc.updateOrder(matchedOrder.id, updatedOrder);
              }
              return of(null);
            })
          );

          // Log Finished Goods stock (FG Stock)
          const fgStockRecord = {
            packing_plan_id: planId,
            buyer_name: this.selectedPlan.buyer_name,
            order_no: this.selectedPlan.order_no,
            style_no: this.selectedPlan.style_no,
            color: this.selectedPlan.color || 'N/A',
            quantity: target,
            cartons: this.selectedPlan.total_planned_cartons || Math.ceil(target / (this.selectedPlan.pcs_per_carton || 24)),
            date: val.date,
            status: 'Ready to Ship'
          };

          return forkJoin({
            plan: this.svc.updatePackingPlan(planDbId, updatedPlan),
            order: orderUpdate$,
            fg: this.svc.createFgStock(fgStockRecord)
          });
        }
        return of(null);
      })
    ).subscribe({
      next: (res) => {
        if (willComplete) {
          this.notify.success('🎉 Daily Packing saved & Order closed successfully! Status set to "Ready to Ship" and items stored in Finished Goods Stock.');
        } else {
          this.notify.success(`Daily packing production saved. Total packed so far: ${totalPacked} / ${target} pcs`);
        }
        this.resetForm();
        this.submitting = false;
      },
      error: () => {
        this.notify.error('Failed to save daily packing production.');
        this.submitting = false;
      }
    });
  }
}
