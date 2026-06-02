import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductionPlanningService } from '../production-planning.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { StyleService } from '../../../core/services/style.service';

@Component({
  selector: 'app-add-production-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header border-0 py-3" style="background:linear-gradient(135deg,#1e3a5f,#2563eb)">
          <h5 class="mb-0 text-white"><i class="bi bi-plus-circle me-2"></i>Add Production Order</h5>
        </div>
        <div class="card-body p-4">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Order ID</label>
                <select class="form-select" formControlName="orderId">
                  <option value="">Select Order</option>
                  <option *ngFor="let o of orders" [value]="o.id">{{ o.poNumber }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Style Code</label>
                <select class="form-select" formControlName="styleCode">
                  <option value="">Select Style</option>
                  <option *ngFor="let s of styles" [value]="s.styleCode">{{ s.styleCode }} - {{ s.styleName }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Plan Quantity</label>
                <input type="number" class="form-control" formControlName="planQty" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Start Date</label>
                <input type="date" class="form-control" formControlName="startDate">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">End Date</label>
                <input type="date" class="form-control" formControlName="endDate">
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" formControlName="status">
                  <option value="Planned">Planned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <!-- Dynamic Size Quantities Grid -->
              <div class="col-md-6 mt-4">
                <div class="card border-0 bg-light p-3 h-100">
                  <h6 class="fw-bold mb-3 text-primary"><i class="bi bi-circle-fill me-2" style="font-size:0.6rem"></i>Short Sleeve Sizes</h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">short s size</label>
                      <input type="number" class="form-control" formControlName="short_S" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">short m size</label>
                      <input type="number" class="form-control" formControlName="short_M" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">short l size</label>
                      <input type="number" class="form-control" formControlName="short_L" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">short xl size</label>
                      <input type="number" class="form-control" formControlName="short_XL" min="0">
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-6 mt-4">
                <div class="card border-0 bg-light p-3 h-100">
                  <h6 class="fw-bold mb-3 text-primary"><i class="bi bi-circle-fill me-2" style="font-size:0.6rem"></i>Full Sleeve Sizes</h6>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">full s size</label>
                      <input type="number" class="form-control" formControlName="full_S" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">full m size</label>
                      <input type="number" class="form-control" formControlName="full_M" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">full l size</label>
                      <input type="number" class="form-control" formControlName="full_L" min="0">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label text-muted small mb-1 fw-semibold">full xl size</label>
                      <input type="number" class="form-control" formControlName="full_XL" min="0">
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-md-12 mt-4">
                <label class="form-label fw-semibold">Description</label>
                <textarea class="form-control" formControlName="description" rows="2" placeholder="Additional notes..."></textarea>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="button" class="btn btn-outline-secondary me-2" (click)="onReset()">Reset</button>
              <button type="submit" class="btn btn-primary px-4" [disabled]="form.invalid">
                <i class="bi bi-check2-circle me-1"></i> Submit Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddProductionOrderComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(ProductionPlanningService);
  private notify = inject(NotificationService);
  private orderSvc = inject(OrderService);
  private styleSvc = inject(StyleService);

  orders: any[] = [];
  styles: any[] = [];

  form: FormGroup = this.fb.group({
    orderId: ['', Validators.required],
    styleCode: ['', Validators.required],
    planQty: [0, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    status: ['Planned', Validators.required],
    description: [''],
    short_S: [0, [Validators.required, Validators.min(0)]],
    short_M: [0, [Validators.required, Validators.min(0)]],
    short_L: [0, [Validators.required, Validators.min(0)]],
    short_XL: [0, [Validators.required, Validators.min(0)]],
    full_S: [0, [Validators.required, Validators.min(0)]],
    full_M: [0, [Validators.required, Validators.min(0)]],
    full_L: [0, [Validators.required, Validators.min(0)]],
    full_XL: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.orderSvc.getOrders().subscribe(orders => {
      this.orders = orders;
      this.styleSvc.getStyles().subscribe(styles => {
        const referencedStyleIds = new Set(orders.map(o => o.styleId).filter(Boolean));
        this.styles = styles.filter(s => referencedStyleIds.has(s.id));
      });
    });
    this.setupStyleSubscription();
    this.setupQuantityCalculation();
  }

  setupStyleSubscription() {
    this.form.get('styleCode')?.valueChanges.subscribe(code => {
      if (!code) {
        this.form.patchValue({
          short_S: 0,
          short_M: 0,
          short_L: 0,
          short_XL: 0,
          full_S: 0,
          full_M: 0,
          full_L: 0,
          full_XL: 0
        }, { emitEvent: false });
        return;
      }
      const selectedStyle = this.styles.find(s => s.styleCode === code);
      if (selectedStyle) {
        const descValue = selectedStyle.description || selectedStyle.styleName || '';
        
        // Find matching orders for this style
        const matchingOrders = this.orders.filter(o => o.styleId === selectedStyle.id);
        
        let shortS = 0, shortM = 0, shortL = 0, shortXL = 0;
        let fullS = 0, fullM = 0, fullL = 0, fullXL = 0;

        matchingOrders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const qty = Number(item.quantity) || 0;
              const size = item.size;
              const type = item.type; // 'Short Sleeve' or 'Full Sleeve'

              if (type === 'Short Sleeve') {
                if (size === 'S') shortS += qty;
                else if (size === 'M') shortM += qty;
                else if (size === 'L') shortL += qty;
                else if (size === 'XL') shortXL += qty;
              } else if (type === 'Full Sleeve') {
                if (size === 'S') fullS += qty;
                else if (size === 'M') fullM += qty;
                else if (size === 'L') fullL += qty;
                else if (size === 'XL') fullXL += qty;
              }
            });
          }
        });

        const patchData: any = {
          description: descValue,
          short_S: shortS,
          short_M: shortM,
          short_L: shortL,
          short_XL: shortXL,
          full_S: fullS,
          full_M: fullM,
          full_L: fullL,
          full_XL: fullXL
        };
        
        const matchingOrder = matchingOrders[0];
        if (matchingOrder) {
          patchData.orderId = matchingOrder.id;
          patchData.planQty = matchingOrder.totalQuantity || (shortS + shortM + shortL + shortXL + fullS + fullM + fullL + fullXL);
          patchData.startDate = matchingOrder.orderDate || '';
          patchData.endDate = matchingOrder.shipDate || '';
        }
        
        this.form.patchValue(patchData, { emitEvent: false });
      }
    });
  }

  setupQuantityCalculation() {
    const sizeControls = ['short_S', 'short_M', 'short_L', 'short_XL', 'full_S', 'full_M', 'full_L', 'full_XL'];
    sizeControls.forEach(ctrlName => {
      this.form.get(ctrlName)?.valueChanges.subscribe(() => {
        const sum = sizeControls.reduce((acc, name) => acc + (Number(this.form.get(name)?.value) || 0), 0);
        this.form.get('planQty')?.setValue(sum, { emitEvent: false });
      });
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const activeSizes: string[] = [];
      const sizeMappings = [
        { key: 'short_S', label: 'Short-S' },
        { key: 'short_M', label: 'Short-M' },
        { key: 'short_L', label: 'Short-L' },
        { key: 'short_XL', label: 'Short-XL' },
        { key: 'full_S', label: 'Full-S' },
        { key: 'full_M', label: 'Full-M' },
        { key: 'full_L', label: 'Full-L' },
        { key: 'full_XL', label: 'Full-XL' }
      ];
      sizeMappings.forEach(m => {
        if (Number(this.form.get(m.key)?.value) > 0) {
          activeSizes.push(m.label);
        }
      });
      
      const sizeStr = activeSizes.join(', ') || 'N/A';
      
      const payload = {
        ...this.form.value,
        size: sizeStr
      };

      this.svc.createProductionOrder(payload).subscribe(() => {
        this.notify.success('Production Order added successfully');
        this.onReset();
      });
    }
  }

  onReset() {
    this.form.reset({
      status: 'Planned',
      planQty: 0,
      short_S: 0,
      short_M: 0,
      short_L: 0,
      short_XL: 0,
      full_S: 0,
      full_M: 0,
      full_L: 0,
      full_XL: 0
    });
  }
}


