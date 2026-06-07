import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { BuyerService } from '../../../core/services/buyer.service';
import { OrderService } from '../../../core/services/order.service';
import { StyleService } from '../../../core/services/style.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { MerchandisingService } from '../../merchandising-service/merchandising.service';

@Component({
  selector: 'app-add-cutting-plan',
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
              <i class="bi bi-scissors fs-4 text-white"></i>
            </div>
            <div>
              <h5 class="mb-0 text-white fw-bold">Add Cutting Plan</h5>
              <small class="text-white-50">Define all cutting parameters for an order lot</small>
            </div>
          </div>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- ── Section 1: Order Reference ─────────────────────── -->
            <div class="section-label">
              <i class="bi bi-link-45deg me-1"></i>Order Reference
            </div>
            <div class="row g-3 mb-4">
              <!-- Buyer Name -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Buyer Name <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="buyer_id"
                        [class.is-invalid]="isInvalid('buyer_id')"
                        (change)="onBuyerChange($event)">
                  <option value="">— Select Buyer —</option>
                  <option *ngFor="let b of buyers" [value]="b.id">
                    {{ b.companyName }} ({{ b.buyerCode }})
                  </option>
                </select>
                <div class="invalid-feedback">Buyer is required.</div>
              </div>

              <!-- Order / PO Number -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order / PO Number <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="order_id"
                        [class.is-invalid]="isInvalid('order_id')"
                        (change)="onOrderChange($event)">
                  <option value="">— Select Order —</option>
                  <option *ngFor="let o of filteredOrders" [value]="o.id">
                    {{ o.poNumber || o.orderId }}
                  </option>
                </select>
                <div class="invalid-feedback">Order is required.</div>
              </div>

              <!-- Style / Lot Number (auto-linked) -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style / Lot Number</label>
                <input class="form-control bg-light" formControlName="style_no" readonly
                       placeholder="Auto-linked from Order">
                <small class="text-muted">Auto-filled when order is selected</small>
              </div>
            </div>

            <!-- ── Section 2: Fabric Details ──────────────────────── -->
            <div class="section-label">
              <i class="bi bi-layers me-1"></i>Fabric Details
            </div>
            <div class="row g-3 mb-4">

              <!-- Fabric Type -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Fabric Type <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="fabric_type"
                        [class.is-invalid]="isInvalid('fabric_type')">
                  <option value="">— Select Fabric Type —</option>
                  <option value="100% Cotton">100% Cotton</option>
                  <option value="Denim">Denim</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Cotton-Polyester Blend">Cotton-Polyester Blend</option>
                  <option value="Linen">Linen</option>
                  <option value="Viscose">Viscose</option>
                  <option value="Rayon">Rayon</option>
                  <option value="Fleece">Fleece</option>
                  <option value="Interlock">Interlock</option>
                  <option value="Knit Jersey">Knit Jersey</option>
                  <option value="Woven Twill">Woven Twill</option>
                  <option value="Other">Other</option>
                </select>
                <div class="invalid-feedback">Fabric Type is required.</div>
              </div>

              <!-- Color -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Color <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="color"
                        [class.is-invalid]="isInvalid('color')">
                  <option value="">— Select Color —</option>
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                  <option value="Navy">Navy</option>
                  <option value="Blue">Blue</option>
                  <option value="Red">Red</option>
                  <option value="Green">Green</option>
                  <option value="Grey">Grey</option>
                  <option value="Khaki">Khaki</option>
                  <option value="Brown">Brown</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Orange">Orange</option>
                  <option value="Pink">Pink</option>
                  <option value="Purple">Purple</option>
                  <option value="Antique Navy">Antique Navy</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
                <div class="invalid-feedback">Color is required.</div>
              </div>

              <!-- Total Fabric Required (auto-populated) -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Total Fabric Required (Yards)</label>
                <input type="number" class="form-control bg-light text-success fw-bold"
                       formControlName="total_fabric_required" readonly
                       placeholder="Auto-populated">
                <small class="text-muted">Auto-fetched from Fabric Records for selected order</small>
              </div>

              <!-- Marker Length -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Marker Length (inches)</label>
                <input type="number" class="form-control" formControlName="marker_length"
                       min="0" step="0.1" placeholder="e.g. 120">
              </div>

              <!-- Marker Width -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Marker Width (inches)</label>
                <input type="number" class="form-control" formControlName="marker_width"
                       min="0" step="0.1" placeholder="e.g. 58">
              </div>

              <!-- Number of Plies / Layers -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Number of Plies / Layers</label>
                <input type="number" class="form-control" formControlName="number_of_plies"
                       min="1" step="1" placeholder="e.g. 60">
              </div>

              <!-- Marker Efficiency (%) -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Marker Efficiency (%)</label>
                <div class="input-group">
                  <input type="number" class="form-control" formControlName="marker_efficiency"
                         min="0" max="100" step="0.1" placeholder="e.g. 85.5">
                  <span class="input-group-text">%</span>
                </div>
              </div>

            </div>

            <!-- ── Section 3: Production Target ───────────────────── -->
            <div class="section-label">
              <i class="bi bi-bullseye me-1"></i>Production Target
            </div>
            <div class="row g-3 mb-4">

              <!-- Planned Pieces (Target Qty) -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Planned Pieces – Target Qty <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="planned_pieces"
                       min="1" placeholder="e.g. 4000"
                       [class.is-invalid]="isInvalid('planned_pieces')">
                <div class="invalid-feedback">Planned Pieces is required.</div>
                <small class="text-muted">Total pieces to be cut in this plan</small>
              </div>

              <!-- Cutting Table Number -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Cutting Table Number</label>
                <input class="form-control" formControlName="cutting_table_number"
                       placeholder="e.g. Table-01, Table-02">
              </div>

            </div>

            <!-- ── Section 4: Assignment & Schedule ───────────────── -->
            <div class="section-label">
              <i class="bi bi-person-check me-1"></i>Assignment & Schedule
            </div>
            <div class="row g-3 mb-4">

              <!-- Cutting Master / Supervisor -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Cutting Master / Supervisor</label>
                <input class="form-control" formControlName="cutting_master"
                       placeholder="e.g. Masud Rana">
              </div>

              <!-- Start Date -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">Start Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="start_date"
                       [class.is-invalid]="isInvalid('start_date')">
                <div class="invalid-feedback">Start Date is required.</div>
              </div>

              <!-- End Date -->
              <div class="col-md-4">
                <label class="form-label fw-semibold">End Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="end_date"
                       [class.is-invalid]="isInvalid('end_date')">
                <div class="invalid-feedback">End Date is required.</div>
              </div>

            </div>

            <!-- Status badge preview -->
            <div class="alert alert-info d-flex align-items-center gap-2 py-2 mb-4" style="border-radius:8px;">
              <i class="bi bi-info-circle-fill text-info"></i>
              <span class="small">
                Status will be automatically set to
                <span class="badge bg-warning text-dark fw-semibold ms-1">Pending</span>
                upon submission. It changes to
                <span class="badge bg-success fw-semibold ms-1">Completed</span>
                automatically once all planned pieces are cut.
              </span>
            </div>

            <!-- ── Actions ─────────────────────────────────────────── -->
            <div class="d-flex justify-content-between align-items-center border-top pt-3">
              <span class="text-muted small">Fields marked <span class="text-danger">*</span> are required</span>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" (click)="resetForm()">
                  <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
                </button>
                <button type="submit" class="btn btn-primary px-5" [disabled]="form.invalid || submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  <i *ngIf="!submitting" class="bi bi-check2-circle me-1"></i>
                  {{ submitting ? 'Saving...' : 'Save Cutting Plan' }}
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
export class AddCuttingPlanComponent implements OnInit {
  private fb       = inject(FormBuilder);
  private svc      = inject(ProductionPlanningService);
  private buyerSvc = inject(BuyerService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);
  private notify   = inject(NotificationService);
  private merchSvc = inject(MerchandisingService);

  buyers:             any[] = [];
  orders:             any[] = [];
  filteredOrders:     any[] = [];
  styles:             any[] = [];
  rawMaterialChecks:  any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    buyer_id:                    ['', Validators.required],
    order_id:                    ['', Validators.required],
    style_no:                    [''],
    fabric_type:                 ['', Validators.required],
    color:                       ['', Validators.required],
    total_fabric_required:       [{ value: null, disabled: true }],
    marker_length:               [null],
    marker_width:                [null],
    number_of_plies:             [null],
    marker_efficiency:           [null, [Validators.min(0), Validators.max(100)]],
    planned_pieces:              [null, [Validators.required, Validators.min(1)]],
    cutting_table_number:        [''],
    cutting_master:              [''],
    start_date:                  [new Date().toISOString().substring(0, 10), Validators.required],
    end_date:                    ['', Validators.required],
    status:                      ['Pending']
  });

  ngOnInit() {
    this.buyerSvc.getBuyers().subscribe(data => this.buyers = data);
    this.orderSvc.getOrders().subscribe(data => this.orders = data);
    this.styleSvc.getStyles().subscribe(data => this.styles = data);
    this.merchSvc.getRawMaterialChecks().subscribe(data => this.rawMaterialChecks = data);
  }

  onBuyerChange(event: any) {
    const buyerId = event.target.value;
    this.filteredOrders = buyerId
      ? this.orders.filter(o => o.buyerId === buyerId)
      : [];
    this.form.patchValue({ order_id: '', style_no: '', total_fabric_required: null });
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const sel = this.orders.find(o => o.id === orderId);
    if (sel) {
      let styleCode = sel.styleNo ?? sel.styleCode ?? '';
      if (!styleCode && sel.styleId) {
        const found = this.styles.find(s => s.id === sel.styleId);
        if (found) styleCode = found.styleCode;
      }
      
      const check = this.rawMaterialChecks.find(c => c.orderDbId === sel.id);
      const totalFabric = check ? check.totalFabricRequired : null;

      this.form.patchValue({
        style_no:              styleCode,
        planned_pieces:        sel.totalQuantity ?? sel.planQty ?? sel.quantity ?? null,
        total_fabric_required: totalFabric
      });
    } else {
      this.form.patchValue({ style_no: '', planned_pieces: null, total_fabric_required: null });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.filteredOrders = [];
    this.form.reset({
      start_date: new Date().toISOString().substring(0, 10),
      status: 'Pending'
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;

    // Get raw value (includes disabled controls)
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      status:          'Pending',   // always Pending on creation
      cutting_plan_id: 'CP-' + Date.now()
    };

    this.svc.createCuttingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Cutting Plan created successfully with status: Pending');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
