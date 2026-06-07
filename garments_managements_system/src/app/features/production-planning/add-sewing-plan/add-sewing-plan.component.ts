import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-sewing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow border-0" style="border-radius:14px; overflow:hidden;">
        <!-- Header -->
        <div class="card-header border-0 py-4 px-4" style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);">
          <div class="d-flex align-items-center gap-3">
            <div class="icon-wrap d-flex align-items-center justify-content-center rounded-3"
                 style="width:48px;height:48px;background:rgba(255,255,255,0.18);">
              <i class="bi bi-layers fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Sewing Plan</h5>
              <small class="text-white-50">Link completed cutting plan and define line targets</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Cutting Plan Reference -->
            <div class="section-label mb-3">
              <i class="bi bi-link-45deg me-1"></i>Cutting Plan Reference
            </div>
            <div class="row g-3 mb-4">
              <!-- Cutting Plan ID (FK) -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">
                  Cutting Plan ID (FK) <span class="text-danger">*</span>
                </label>
                <select class="form-select" formControlName="cutting_plan_id"
                        (change)="onCuttingPlanChange($event)"
                        [class.is-invalid]="isInvalid('cutting_plan_id')">
                  <option value="">— Select Completed Cutting Plan —</option>
                  <option *ngFor="let cp of cuttingPlans" [value]="cp.cutting_plan_id ?? cp.id">
                    {{ cp.cutting_plan_id ?? cp.id }}
                    {{ cp.style_no ? ' · Style: ' + cp.style_no : '' }}
                    {{ cp.planned_pieces ? ' · Target: ' + cp.planned_pieces + ' pcs' : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Cutting Plan reference is required.</div>
                <small class="text-muted">Only plans with status <strong>Completed</strong> or <strong>Done</strong> appear here.</small>
              </div>

              <!-- Input Received Qty (from Cutting) -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Input Received Qty (from Cutting)</label>
                <input type="number" class="form-control bg-light text-primary fw-bold" 
                       formControlName="input_received_qty" readonly
                       placeholder="Auto-filled from Cutting Plan">
                <small class="text-muted">Total actual pieces cut in the selected plan</small>
              </div>
            </div>

            <!-- Section 2: Auto-filled Details -->
            <div class="section-label mb-3">
              <i class="bi bi-info-circle me-1"></i>Auto-filled Details
            </div>
            <div class="row g-3 mb-4">
              <!-- Buyer Name -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Buyer Name</label>
                <input class="form-control bg-light" formControlName="buyer_name" readonly
                       placeholder="Auto-filled">
              </div>

              <!-- Order / PO No -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Order No</label>
                <input class="form-control bg-light" formControlName="order_no" readonly
                       placeholder="Auto-filled">
              </div>

              <!-- Style No -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control bg-light" formControlName="style_no" readonly
                       placeholder="Auto-filled">
              </div>

              <!-- Color -->
              <div class="col-md-3">
                <label class="form-label fw-semibold">Color</label>
                <input class="form-control bg-light" formControlName="color" readonly
                       placeholder="Auto-filled">
              </div>
            </div>

            <!-- Section 3: Schedule -->
            <div class="section-label mb-3">
              <i class="bi bi-calendar-range me-1"></i>Schedule
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Start Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="start_date"
                       [class.is-invalid]="isInvalid('start_date')">
                <div class="invalid-feedback">Start Date is required.</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">End Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="end_date"
                       [class.is-invalid]="isInvalid('end_date')">
                <div class="invalid-feedback">End Date is required.</div>
              </div>
            </div>

            <!-- Section 4: Line & Production Target -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="section-label mb-0">
                <i class="bi bi-diagram-3 me-1"></i>Line & Production Target
              </div>
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="addTarget()">
                <i class="bi bi-plus-lg me-1"></i>Add Row
              </button>
            </div>
            
            <div formArrayName="targets">
              <div *ngFor="let target of targetsArray.controls; let i = index" [formGroupName]="i" 
                   class="row g-3 mb-3 align-items-end border rounded p-3 bg-light position-relative">
                
                <!-- Remove button -->
                <button type="button" class="btn-close position-absolute" 
                        style="top:10px; right:10px; font-size:0.8rem;" 
                        aria-label="Close"
                        (click)="removeTarget(i)" 
                        *ngIf="targetsArray.length > 1">
                </button>

                <!-- Line No -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Line No <span class="text-danger">*</span></label>
                  <select class="form-select" formControlName="line_no"
                          [class.is-invalid]="target.get('line_no')?.invalid && (target.get('line_no')?.dirty || target.get('line_no')?.touched)">
                    <option value="">— Select Line —</option>
                    <option *ngFor="let l of lines" [value]="l.lineId">
                      {{ l.lineId }}
                    </option>
                  </select>
                  <div class="invalid-feedback">Line number is required.</div>
                </div>

                <!-- Target Quantity -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Target Quantity <span class="text-danger">*</span></label>
                  <input type="number" class="form-control" formControlName="target_quantity" min="1"
                         placeholder="e.g. 2000"
                         [class.is-invalid]="target.get('target_quantity')?.invalid && (target.get('target_quantity')?.dirty || target.get('target_quantity')?.touched)">
                  <div class="invalid-feedback">Must be at least 1.</div>
                </div>
              </div>
            </div>

            <!-- Status preview -->
            <div class="alert alert-info d-flex align-items-center gap-2 py-2 mb-4" style="border-radius:8px;">
              <i class="bi bi-info-circle-fill text-info"></i>
              <span class="small">
                Status will be automatically set to
                <span class="badge bg-primary fw-semibold ms-1">In Sewing</span>
                upon submission.
              </span>
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
                  {{ submitting ? 'Saving...' : 'Save Sewing Plan' }}
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
      border-left: 3px solid #2563eb;
      padding-left: 8px;
      margin-bottom: 12px;
      margin-top: 4px;
    }
  `]
})
export class AddSewingPlanComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private svc      = inject(ProductionPlanningService);
  private buyerSvc = inject(BuyerService);
  private orderSvc = inject(OrderService);
  private notify   = inject(NotificationService);
  private router   = inject(Router);

  buyers: any[] = [];
  orders: any[] = [];
  cuttingPlans: any[] = [];
  dailyCuttingRecords: any[] = [];
  lines: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    cutting_plan_id:    ['', Validators.required],
    order_id:           [''],
    buyer_id:           [''],
    buyer_name:         [''],
    order_no:           [''],
    style_no:           [''],
    color:              [''],
    input_received_qty: [null],
    start_date:         [new Date().toISOString().substring(0, 10), Validators.required],
    end_date:           ['', Validators.required],
    targets:            this.fb.array([this.createTargetRow()]),
    status:             ['In Sewing']
  });

  get targetsArray(): FormArray {
    return this.form.get('targets') as FormArray;
  }

  createTargetRow(): FormGroup {
    return this.fb.group({
      line_no: ['', Validators.required],
      target_quantity: [null, [Validators.required, Validators.min(1)]]
    });
  }

  addTarget() {
    this.targetsArray.push(this.createTargetRow());
  }

  removeTarget(i: number) {
    if (this.targetsArray.length > 1) {
      this.targetsArray.removeAt(i);
    }
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    forkJoin({
      buyers: this.buyerSvc.getBuyers(),
      orders: this.orderSvc.getOrders(),
      plans:  this.svc.getCuttingPlans(),
      daily:  this.svc.getDayWiseCuttingProduction(),
      lines:  this.svc.getLines()
    }).subscribe({
      next: ({ buyers, orders, plans, daily, lines }) => {
        this.buyers = buyers;
        this.orders = orders;
        this.dailyCuttingRecords = daily;
        this.lines = lines;
        
        // Filter: only Completed or Done cutting plans
        this.cuttingPlans = plans.filter((p: any) => p.status === 'Completed' || p.status === 'Done');
      }
    });
  }

  onCuttingPlanChange(event: any) {
    const cpId = event.target.value;
    const cp = this.cuttingPlans.find(p => (p.cutting_plan_id ?? p.id) === cpId);
    
    if (cp) {
      // Find actual total cut quantity by summing actual cut pieces from day-wise cutting production
      const actualQty = this.dailyCuttingRecords
        .filter(r => (r.cutting_plan_id || r.plan_id) === cpId)
        .reduce((sum, r) => sum + (Number(r.actual_cut_pieces) || 0), 0) || cp.planned_pieces || cp.actual_pieces || 0;

      // Find buyer name
      const buyer = this.buyers.find(b => b.id === cp.buyer_id);
      const buyerName = buyer ? buyer.companyName : '';

      // Find order number
      const order = this.orders.find(o => o.id === cp.order_id);
      const orderNo = order ? (order.poNumber || order.orderId) : cp.order_id;

      this.form.patchValue({
        order_id:           cp.order_id || '',
        buyer_id:           cp.buyer_id || '',
        buyer_name:         buyerName,
        order_no:           orderNo,
        style_no:           cp.style_no || '',
        color:              cp.color || '',
        input_received_qty: actualQty,
        end_date:           cp.end_date || ''
      });
    } else {
      this.form.patchValue({
        order_id:           '',
        buyer_id:           '',
        buyer_name:         '',
        order_no:           '',
        style_no:           '',
        color:              '',
        input_received_qty: null,
        end_date:           ''
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      start_date: new Date().toISOString().substring(0, 10),
      status: 'In Sewing'
    });
    while (this.targetsArray.length > 1) {
      this.targetsArray.removeAt(1);
    }
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    // Get raw value
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      status:         'In Sewing',
      sewing_plan_id: 'SP-' + Date.now()
    };

    this.svc.createSewingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Sewing Plan created successfully with status: In Sewing');
        this.resetForm();
        this.submitting = false;
        this.router.navigate(['/production-planning/view-sewing-plan']);
      },
      error: () => { this.submitting = false; }
    });
  }
}

