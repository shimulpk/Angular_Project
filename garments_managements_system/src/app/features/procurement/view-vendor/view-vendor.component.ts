import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../../core/services/procurement.service';

@Component({
  selector: 'app-view-vendor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-person-lines-fill me-2"></i>Vendor List</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Company Name</th>
                  <th>Contact Person</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let vendor of vendors">
                  <td class="fw-medium">{{ vendor.companyName }}</td>
                  <td>{{ vendor.contactPerson }}</td>
                  <td>{{ vendor.phone }}</td>
                  <td class="text-muted"><small>{{ vendor.address }}</small></td>
                </tr>
                <tr *ngIf="vendors.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No vendors found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewVendorComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  vendors: any[] = [];

  ngOnInit() {
    this.procurementService.getVendors().subscribe(data => this.vendors = data);
  }
}
