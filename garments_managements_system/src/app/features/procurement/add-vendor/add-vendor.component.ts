import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-vendor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-person-plus me-2"></i>Add Vendor</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="vendorForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Company Name</label>
                <input type="text" class="form-control" formControlName="companyName" placeholder="Enter company name">
              </div>
              <div class="col-md-6">
                <label class="form-label">Contact Person</label>
                <input type="text" class="form-control" formControlName="contactPerson" placeholder="Enter contact person">
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone</label>
                <input type="text" class="form-control" formControlName="phone" placeholder="Enter phone number">
              </div>
              <div class="col-md-12">
                <label class="form-label">Address</label>
                <textarea class="form-control" formControlName="address" rows="3" placeholder="Enter full address"></textarea>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="vendorForm.invalid">Save Vendor</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddVendorComponent {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  vendorForm: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    contactPerson: ['', Validators.required],
    phone: ['', Validators.required],
    address: ['', Validators.required]
  });

  onSubmit() {
    if (this.vendorForm.valid) {
      this.procurementService.createVendor(this.vendorForm.value).subscribe(() => {
        this.notify.success('Vendor added successfully');
        this.vendorForm.reset();
      });
    }
  }
}
