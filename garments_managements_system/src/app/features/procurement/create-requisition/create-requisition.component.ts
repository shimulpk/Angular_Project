import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-create-requisition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-file-earmark-plus me-2"></i>Purchase Requisition Form</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="reqForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">PR Date</label>
                <input type="date" class="form-control" formControlName="prDate">
              </div>
              <div class="col-md-3">
                <label class="form-label">Department</label>
                <input type="text" class="form-control" formControlName="department" placeholder="e.g. Production">
              </div>
              <div class="col-md-3">
                <label class="form-label">Requested By</label>
                <input type="text" class="form-control" formControlName="requestedBy" >
              </div>
              <div class="col-md-3">
                <label class="form-label">PR Status</label>
                <select class="form-select" formControlName="status">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Category Name</label>
                <select class="form-select" formControlName="categoryName">
                  <option value="">Select Category</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Trims">Trims</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Order ID</label>
                <select class="form-select" formControlName="orderId">
                  <option value="">Select Order ID</option>
                  <option *ngFor="let order of orders" [value]="order.orderId">
                    {{ order.orderId }} ({{ order.poNumber }})
                  </option>
                </select>
              </div>
              
              <div class="col-md-4"></div>

              <div class="col-md-4">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" formControlName="quantity" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label">Approx. Unit Price</label>
                <input type="number" class="form-control" formControlName="unitPrice" min="0">
              </div>
              <div class="col-md-4">
                <label class="form-label">Total Estimated Price</label>
                <input type="number" class="form-control" formControlName="totalPrice" readonly>
              </div>
            </div>
            
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="reqForm.invalid">Submit Requisition</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CreateRequisitionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  orders: any[] = [];

  reqForm: FormGroup = this.fb.group({
    prDate: [new Date().toISOString().substring(0, 10), Validators.required],
    department: ['', Validators.required],
    requestedBy: [this.authService.currentUserValue?.fullName || ''],
    categoryName: ['', Validators.required],
    orderId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    totalPrice: [0],
    status: ['Pending', Validators.required]
  });

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
      },
      error: (err) => {
        this.notify.error('Failed to load orders');
        console.error(err);
      }
    });

    this.reqForm.valueChanges.subscribe(val => {
      const q = val.quantity || 0;
      const p = val.unitPrice || 0;
      const total = q * p;
      if (val.totalPrice !== total) {
        this.reqForm.patchValue({ totalPrice: total }, { emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.reqForm.valid) {
      this.procurementService.createRequisition(this.reqForm.getRawValue()).subscribe(() => {
        this.notify.success('Requisition Created Successfully');
        this.reqForm.reset({
          prDate: new Date().toISOString().substring(0, 10),
          requestedBy: this.authService.currentUserValue?.fullName || '',
          status: 'Pending',
          quantity: 0,
          unitPrice: 0,
          totalPrice: 0
        });
      });
    }
  }
}
