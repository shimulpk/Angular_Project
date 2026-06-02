import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { StyleService } from '../../../core/services/style.service';
import { BuyerService } from '../../../core/services/buyer.service';

@Component({
  selector: 'app-add-packing-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <!-- Header -->
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-box-seam me-2"></i>Add Packing Plan</h5>
          <small class="text-white-50">Link finishing plan → define carton, poly bag, shipment details</small>
        </div>

        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">

            <!-- Section 1: FK References -->
            <div class="section-title mb-2">
              <i class="bi bi-link-45deg me-1"></i>Order & Finishing Plan Reference
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order ID <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="order_id" (change)="onOrderChange($event)"
                  [class.is-invalid]="isInvalid('order_id')">
                  <option value="">— Select Order —</option>
                  <option *ngFor="let o of orders" [value]="o.id ?? o.orderId">
                    {{ o.id ?? o.orderId }}{{ o.buyerName ? ' · ' + o.buyerName : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Order is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Finishing Plan ID (FK) <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="finishing_plan_id"
                  (change)="onFinishingPlanChange($event)"
                  [class.is-invalid]="isInvalid('finishing_plan_id')">
                  <option value="">— Select Finishing Plan —</option>
                  <option *ngFor="let fp of finishingPlans" [value]="fp.finishing_plan_id ?? fp.id">
                    {{ fp.finishing_plan_id ?? fp.id }}
                    {{ fp.style_no ? ' · ' + fp.style_no : '' }}
                  </option>
                </select>
                <div class="invalid-feedback">Finishing Plan reference is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style No</label>
                <input class="form-control" formControlName="style_no" readonly placeholder="Auto-filled from Order">
              </div>
            </div>

            <!-- Section 2: Buyer & Input -->
            <div class="section-title mb-2">
              <i class="bi bi-person-badge me-1"></i>Buyer & Quantity Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Buyer Name</label>
                <input class="form-control" formControlName="buyer_name" readonly placeholder="Auto-filled from Order">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Input Qty (from Finishing) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="input_qty" min="1"
                  [class.is-invalid]="isInvalid('input_qty')" placeholder="e.g. 1060">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Total Packed Qty (pcs) <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="total_packed_qty" min="0"
                  [class.is-invalid]="isInvalid('total_packed_qty')" placeholder="e.g. 1050">
                <div class="invalid-feedback">Required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Rejection Qty (during Packing)</label>
                <input type="number" class="form-control" formControlName="rejection_qty" min="0" placeholder="e.g. 10">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Packing Method <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="packing_method"
                  [class.is-invalid]="isInvalid('packing_method')">
                  <option value="">— Select Method —</option>
                  <option value="Solid">Solid</option>
                  <option value="Ratio">Ratio</option>
                  <option value="Assorted">Assorted</option>
                </select>
                <div class="invalid-feedback">Packing method is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status <span class="text-danger">*</span></label>
                <select class="form-select" formControlName="status"
                  [class.is-invalid]="isInvalid('status')">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Shipped">Shipped</option>
                </select>
              </div>
            </div>

            <!-- Section 3: Carton Details -->
            <div class="section-title mb-2">
              <i class="bi bi-archive me-1"></i>Carton & Poly Bag Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label fw-semibold">Carton Qty <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="carton_qty" min="1"
                  [class.is-invalid]="isInvalid('carton_qty')" placeholder="e.g. 50">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Pcs Per Carton <span class="text-danger">*</span></label>
                <input type="number" class="form-control" formControlName="pcs_per_carton" min="1"
                  [class.is-invalid]="isInvalid('pcs_per_carton')" placeholder="e.g. 12">
                <div class="invalid-feedback">Must be at least 1.</div>
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Poly Bag Type</label>
                <input class="form-control" formControlName="poly_bag_type" placeholder="e.g. LDPE 12x16 inch">
              </div>
              <div class="col-md-3">
                <label class="form-label fw-semibold">Barcode</label>
                <input class="form-control" formControlName="barcode" placeholder="Scan or enter barcode">
              </div>
            </div>

            <!-- Section 4: Hang Tag Toggle -->
            <div class="section-title mb-2">
              <i class="bi bi-tag me-1"></i>Tagging & Labels
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold d-block">Hang Tag Required</label>
                <div class="form-check form-switch mt-1">
                  <input class="form-check-input" type="checkbox" role="switch"
                    id="hangTagToggle" formControlName="hang_tag">
                  <label class="form-check-label" for="hangTagToggle">
                    {{ form.get('hang_tag')?.value ? 'Yes – Hang Tag Required' : 'No – Skip Hang Tag' }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Section 5: Shipment Details -->
            <div class="section-title mb-2">
              <i class="bi bi-ship me-1"></i>Shipment Details
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Shipment Date <span class="text-danger">*</span></label>
                <input type="date" class="form-control" formControlName="shipment_date"
                  [class.is-invalid]="isInvalid('shipment_date')">
                <div class="invalid-feedback">Shipment date is required.</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Destination (Country / Port) <span class="text-danger">*</span></label>
                <input class="form-control" formControlName="destination"
                  placeholder="e.g. Hamburg, Germany" [class.is-invalid]="isInvalid('destination')">
                <div class="invalid-feedback">Destination is required.</div>
              </div>
            </div>

            <!-- Computed summary banner -->
            <div class="alert alert-light border rounded-3 mb-3 d-flex gap-4 flex-wrap"
              *ngIf="form.get('carton_qty')?.value && form.get('pcs_per_carton')?.value">
              <div>
                <span class="text-muted small">Computed Total</span>
                <div class="fw-bold fs-5 text-primary">
                  {{ (form.get('carton_qty')?.value ?? 0) * (form.get('pcs_per_carton')?.value ?? 0) | number }} pcs
                </div>
                <span class="text-muted small">(Cartons × Pcs/Carton)</span>
              </div>
              <div *ngIf="form.get('total_packed_qty')?.value">
                <span class="text-muted small">Packed Qty</span>
                <div class="fw-bold fs-5" [class.text-success]="isPackedOk" [class.text-danger]="!isPackedOk">
                  {{ form.get('total_packed_qty')?.value | number }} pcs
                </div>
                <span class="text-muted small">{{ isPackedOk ? '✔ Matches' : '⚠ Mismatch' }}</span>
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
                  {{ submitting ? 'Saving...' : 'Save Packing Plan' }}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #6c757d;
      border-left: 3px solid #2563eb;
      padding-left: 8px;
      margin-bottom: 10px;
    }
    .form-check-input { width: 2.5em; height: 1.3em; cursor: pointer; }
    .form-check-input:checked { background-color: #2563eb; border-color: #2563eb; }
  `]
})
export class AddPackingPlanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);
  private buyerSvc = inject(BuyerService);
  private notify = inject(NotificationService);

  orders: any[] = [];
  finishingPlans: any[] = [];
  styles: any[] = [];
  buyers: any[] = [];
  submitting = false;

  form: FormGroup = this.fb.group({
    order_id:           ['', Validators.required],
    finishing_plan_id:  ['', Validators.required],
    style_no:           [''],
    buyer_name:         [''],
    input_qty:          [null, [Validators.required, Validators.min(1)]],
    total_packed_qty:   [null, [Validators.required, Validators.min(0)]],
    rejection_qty:      [null, Validators.min(0)],
    packing_method:     ['', Validators.required],
    carton_qty:         [null, [Validators.required, Validators.min(1)]],
    pcs_per_carton:     [null, [Validators.required, Validators.min(1)]],
    poly_bag_type:      [''],
    barcode:            [''],
    hang_tag:           [false],
    shipment_date:      ['', Validators.required],
    destination:        ['', Validators.required],
    status:             ['Pending', Validators.required]
  });

  get isPackedOk(): boolean {
    const computed = (this.form.get('carton_qty')?.value ?? 0) * (this.form.get('pcs_per_carton')?.value ?? 0);
    return computed === (this.form.get('total_packed_qty')?.value ?? 0);
  }

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(data => this.orders = data);
    this.svc.getFinishingPlans().subscribe(data => this.finishingPlans = data);
    this.styleSvc.getStyles().subscribe(data => this.styles = data);
    this.buyerSvc.getBuyers().subscribe(data => this.buyers = data);
  }

  onOrderChange(event: any) {
    const orderId = event.target.value;
    const sel = this.orders.find(o => (o.id ?? o.orderId) === orderId);
    if (sel) {
      let styleCode = sel.styleNo ?? sel.styleCode ?? '';
      if (!styleCode && sel.styleId) {
        const foundStyle = this.styles.find(s => s.id === sel.styleId);
        if (foundStyle) styleCode = foundStyle.styleCode;
      }
      
      let bName = sel.buyerName ?? '';
      let dest = '';
      if (sel.buyerId) {
        const foundBuyer = this.buyers.find(b => (b.id ?? b.buyerId) === sel.buyerId);
        if (foundBuyer) {
           bName = foundBuyer.companyName ?? foundBuyer.name ?? bName;
           dest = [foundBuyer.address, foundBuyer.country].filter(Boolean).join(', ');
        }
      }

      this.form.patchValue({
        style_no:       styleCode,
        buyer_name:     bName,
        destination:    dest,
        shipment_date:  sel.endDate ?? sel.shipDate ?? ''
      });
      
      this.svc.getFinishingPlans().subscribe(plans => {
        const matching = plans.filter(p => (p.order_id ?? p.orderId) === orderId);
        this.finishingPlans = matching;
        
        if (matching.length > 0) {
           const totalPass = matching.reduce((sum, p) => sum + (Number(p.pass_qty) || 0), 0);
           this.form.patchValue({ input_qty: totalPass > 0 ? totalPass : null });
           
           if (matching.length === 1) {
              this.form.patchValue({ finishing_plan_id: matching[0].finishing_plan_id ?? matching[0].id });
           }
        } else {
           this.form.patchValue({ input_qty: null });
        }
      });
    } else {
      this.form.patchValue({ style_no: '', buyer_name: '', shipment_date: '', destination: '', finishing_plan_id: '', input_qty: null });
      this.svc.getFinishingPlans().subscribe(data => this.finishingPlans = data);
    }
  }

  onFinishingPlanChange(event: any) {
    const fpId = event.target.value;
    const fp = this.finishingPlans.find(p => (p.finishing_plan_id ?? p.id) === fpId);
    if (fp) {
      this.form.patchValue({ input_qty: fp.pass_qty || null });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  resetForm() {
    this.form.reset({
      status:   'Pending',
      hang_tag: false
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const payload = {
      ...this.form.value,
      packing_plan_id: 'PKG-' + Date.now(),
      computed_total:  (this.form.value.carton_qty ?? 0) * (this.form.value.pcs_per_carton ?? 0)
    };
    this.svc.createPackingPlan(payload).subscribe({
      next: () => {
        this.notify.success('Packing Plan created successfully');
        this.resetForm();
        this.submitting = false;
      },
      error: () => { this.submitting = false; }
    });
  }
}
