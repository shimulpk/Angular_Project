import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-day-wise-cutting-production',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <!-- Header -->
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-calendar-plus me-2"></i>Add Day Wise Cutting Production</h5>
          <small class="text-white-50">Track daily cutting production metrics and output</small>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: Core Details -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2 mt-1">
              <i class="bi bi-info-circle me-1"></i>Core Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Order ID <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="order_id" [class.is-invalid]="isInvalid('order_id')">
                  <option value="">— Select Order —</option>
                  <option *ngFor="let cp of cuttingPlans" [value]="cp.order_id || cp.orderId || cp.id">
                    Order: {{ cp.order_id || cp.orderId || cp.id }} {{ cp.cutting_plan_id ? '(Plan: ' + cp.cutting_plan_id + ')' : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Order ID is required.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control" formControlName="style_no" readonly placeholder="Auto-filled">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Stage</label>
                <input class="form-control bg-light" formControlName="stage" readonly>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Supervisor / Operator Name</label>
                <input class="form-control" formControlName="supervisor_name" readonly placeholder="Auto-filled">
              </div>
            </div>

            <!-- Section 2: Tracking Details -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2">
              <i class="bi bi-clock-history me-1"></i>Tracking Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="date" [class.is-invalid]="isInvalid('date')">
                <div class="invalid-feedback">Date is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Shift <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="shift" [class.is-invalid]="isInvalid('shift')">
                  <option value="">— Select Shift —</option>
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                </select>
                <div class="invalid-feedback">Shift is required.</div>
              </div>
              <div class="col-12 mt-4">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <label class="form-label fw-semibold mb-0">Line Allocations (Split Production)</label>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addLineAllocation()">
                    <i class="bi bi-plus-circle me-1"></i>Add Line
                  </button>
                </div>
                
                <div formArrayName="line_allocations">
                  <div *ngFor="let lineGroup of lineAllocations.controls; let i = index" [formGroupName]="i" class="row g-2 mb-2 align-items-center">
                    <div class="col-md-5">
                      <select class="form-select" formControlName="line_id" [class.is-invalid]="isLineInvalid(i, 'line_id')">
                        <option value="">— Select Line —</option>
                        <option *ngFor="let line of lines" [value]="line.lineId || line.id">{{ line.lineId || line.id }} {{ line.capacityPerDay ? '(Cap: ' + line.capacityPerDay + ')' : '' }}</option>
                      </select>
                    </div>
                    <div class="col-md-5">
                      <input type="number" class="form-control" formControlName="quantity" min="0" placeholder="Allocated Quantity" [class.is-invalid]="isLineInvalid(i, 'quantity')">
                    </div>
                    <div class="col-md-2 text-end">
                      <button type="button" class="btn btn-outline-danger btn-sm" (click)="removeLineAllocation(i)" [disabled]="lineAllocations.length === 1">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Quantity Metrics -->
            <div class="section-title text-uppercase fw-bold text-secondary small mb-2">
              <i class="bi bi-bar-chart-steps me-1"></i>Quantity Metrics
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Target Quantity</label>
                <input type="number" class="form-control" formControlName="target_quantity" readonly placeholder="Auto-calculated">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Actual Quantity <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="actual_quantity" min="0" [class.is-invalid]="isInvalid('actual_quantity')">
                <div class="invalid-feedback">Actual Quantity is required.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Reject Quantity <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="reject_quantity" min="0" [class.is-invalid]="isInvalid('reject_quantity')">
                <div class="invalid-feedback">Reject Quantity is required.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Remaining Quantity</label>
                <input type="number" class="form-control fw-bold" formControlName="remaining_quantity" readonly [ngClass]="{'text-success': form.get('remaining_quantity')?.value === 0, 'text-danger': form.get('remaining_quantity')?.value < 0}">
              </div>
            </div>

            <!-- Section 4: Remarks -->
            <div class="row g-3 mb-4">
              <div class="col-12">
                <label class="form-label fw-semibold">Remarks / Notes</label>
                <textarea class="form-control" formControlName="remarks" rows="2"
                  placeholder="Capture delays, machine problems, special instructions..."></textarea>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  {{ submitting ? 'Saving...' : 'Save Production' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title { border-left: 3px solid #2563eb; padding-left: 8px; margin-bottom: 10px; }
  `]
})
export class AddDayWiseCuttingProductionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);

  cuttingPlans: any[] = [];
  lines: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    order_id:         ['', Validators.required],
    style_no:         [''],
    stage:            ['Cutting'], // Read-only "Cutting"
    date:             [new Date().toISOString().substring(0, 10), Validators.required],
    shift:            ['', Validators.required],
    target_quantity:  [null], // Fetched from Planned Pieces
    actual_quantity:  [null, [Validators.required, Validators.min(0)]],
    reject_quantity:  [0, [Validators.required, Validators.min(0)]],
    remaining_quantity: [{value: null, disabled: true}], // Auto-calculated field
    line_allocations: this.fb.array([ this.createLineAllocation() ]),
    supervisor_name:  [''], // Fetched from Assigned To
    remarks:          ['']
  });

  get lineAllocations(): FormArray {
    return this.form.get('line_allocations') as FormArray;
  }

  createLineAllocation(): FormGroup {
    return this.fb.group({
      line_id: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]]
    });
  }

  addLineAllocation() {
    this.lineAllocations.push(this.createLineAllocation());
  }

  removeLineAllocation(index: number) {
    if (this.lineAllocations.length > 1) {
      this.lineAllocations.removeAt(index);
    }
  }

  ngOnInit() {
    this.svc.getCuttingPlans().subscribe(data => this.cuttingPlans = data);
    this.svc.getLines().subscribe(data => this.lines = data);

    // Watch for Order ID changes to trigger autofill
    this.form.get('order_id')?.valueChanges.subscribe(orderId => {
      if (orderId) {
        const sel = this.cuttingPlans.find(cp => (cp.order_id || cp.orderId || cp.id) == orderId);
        if (sel) {
          this.form.patchValue({
            style_no:         sel.style_no || sel.styleNo || '',
            target_quantity:  sel.planned_pieces || sel.totalQuantity || sel.planQty || null,
            supervisor_name:  sel.assigned_to || sel.assignedTo || ''
          }, { emitEvent: false });
        } else {
          this.form.patchValue({ style_no: '', target_quantity: null, supervisor_name: '' }, { emitEvent: false });
        }
      } else {
        this.form.patchValue({ style_no: '', target_quantity: null, supervisor_name: '' }, { emitEvent: false });
      }
    });

    // Watch quantities to auto-calculate remaining quantity
    this.form.valueChanges.subscribe(val => {
      const target = this.form.get('target_quantity')?.value || 0;
      const actual = this.form.get('actual_quantity')?.value || 0;
      const reject = this.form.get('reject_quantity')?.value || 0;
      
      // Calculate remaining quantity
      const remaining = target - (actual + reject);
      
      // Update if changed (using emitEvent: false to prevent infinite loop)
      const currentRemaining = this.form.get('remaining_quantity')?.value;
      if (currentRemaining !== remaining) {
        this.form.patchValue({ remaining_quantity: remaining }, { emitEvent: false });
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  isLineInvalid(index: number, field: string): boolean {
    const c = this.lineAllocations.at(index).get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      stage: 'Cutting',
      date: new Date().toISOString().substring(0, 10),
      reject_quantity: 0
    });
    
    // Reset FormArray to 1 item
    while (this.lineAllocations.length !== 0) {
      this.lineAllocations.removeAt(0);
    }
    this.addLineAllocation();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    
    this.svc.createDayWiseCuttingProduction(this.form.value).subscribe({
      next: () => {
        this.notify.success('Daily Cutting Production added successfully');
        this.resetForm();
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
        this.notify.error('Failed to add Daily Cutting Production');
      }
    });
  }
}
