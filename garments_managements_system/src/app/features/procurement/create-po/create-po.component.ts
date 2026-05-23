import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-create-po',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-cart-plus me-2"></i>Create Purchase Order</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="poForm" (ngSubmit)="onSubmit()">
            <div class="row g-3 mb-4">
              <div class="col-md-3">
                <label class="form-label">PO Number</label>
                <input type="text" class="form-control" formControlName="poNumber" placeholder="e.g. PO-2026-001">
              </div>
              <div class="col-md-3">
                <label class="form-label">PO Date</label>
                <input type="date" class="form-control" formControlName="poDate">
              </div>
              <div class="col-md-3">
                <label class="form-label">Delivery Date</label>
                <input type="date" class="form-control" formControlName="deliveryDate">
              </div>
              <div class="col-md-3">
                <label class="form-label">Select Vendor</label>
                <select class="form-select" formControlName="vendorId">
                  <option value="">Select Vendor</option>
                  <option *ngFor="let v of vendors" [value]="v.id">{{ v.companyName }}</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Link to Requisition</label>
                <select class="form-select" formControlName="requisitionId" (change)="onReqSelect()">
                  <option value="">Select Requisition</option>
                  <option *ngFor="let r of requisitions" [value]="r.id">Req #{{ r.id }} - {{ r.categoryName }} (Order {{ r.orderId }})</option>
                </select>
              </div>
            </div>

            <!-- Ordered Items Section -->
            <div class="card bg-light border-0 mb-4" *ngIf="poForm.get('requisitionId')?.value">
              <div class="card-body">
                <h6 class="text-primary mb-3">Item Details (Auto-filled from Requisition)</h6>
                <div class="row g-3">
                  <div class="col-md-3">
                    <label class="form-label">Product Name/Category</label>
                    <input type="text" class="form-control" formControlName="productName" readonly>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Quantity</label>
                    <input type="number" class="form-control" formControlName="quantity" readonly>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Unit Price</label>
                    <input type="number" class="form-control" formControlName="unitPrice" readonly>
                  </div>
                  <div class="col-md-2">
                    <label class="form-label">Tax (%)</label>
                    <input type="number" class="form-control" formControlName="taxPercent" min="0">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Total Price (Incl. Tax)</label>
                    <input type="number" class="form-control" formControlName="totalPrice" readonly>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="poForm.invalid">Create PO</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CreatePoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  vendors: any[] = [];
  requisitions: any[] = [];

  poForm: FormGroup = this.fb.group({
    poNumber: ['', Validators.required],
    poDate: [new Date().toISOString().substring(0, 10), Validators.required],
    deliveryDate: ['', Validators.required],
    vendorId: ['', Validators.required],
    requisitionId: ['', Validators.required],
    productName: [''],
    quantity: [0],
    unitPrice: [0],
    taxPercent: [0, [Validators.min(0)]],
    totalPrice: [0]
  });

  ngOnInit() {
    this.procurementService.getVendors().subscribe(v => this.vendors = v);
    // Only load approved requisitions
    this.procurementService.getRequisitions().subscribe(r => {
      this.requisitions = r.filter((req: any) => req.status === 'Approved');
    });

    // Auto calculate total
    this.poForm.valueChanges.subscribe(val => {
      const q = val.quantity || 0;
      const p = val.unitPrice || 0;
      const t = val.taxPercent || 0;
      
      const subTotal = q * p;
      const taxAmount = subTotal * (t / 100);
      const total = subTotal + taxAmount;
      
      if (val.totalPrice !== total) {
        this.poForm.patchValue({ totalPrice: total }, { emitEvent: false });
      }
    });
  }

  onReqSelect() {
    const reqId = this.poForm.get('requisitionId')?.value;
    if (reqId) {
      const req = this.requisitions.find(r => r.id === reqId);
      if (req) {
        this.poForm.patchValue({
          productName: req.categoryName,
          quantity: req.quantity,
          unitPrice: req.unitPrice
        });
      }
    }
  }

  onSubmit() {
    if (this.poForm.valid) {
      const formValue = this.poForm.getRawValue();
      const vendorInfo = this.vendors.find(v => v.id === formValue.vendorId);
      
      const poData = {
        ...formValue,
        vendorName: vendorInfo?.companyName,
        vendorPhone: vendorInfo?.phone,
        status: 'Issued'
      };

      this.procurementService.createPurchaseOrder(poData).subscribe(() => {
        this.notify.success('Purchase Order Created');
        this.poForm.reset({
          poDate: new Date().toISOString().substring(0, 10),
          quantity: 0,
          unitPrice: 0,
          taxPercent: 0,
          totalPrice: 0
        });
      });
    }
  }
}
