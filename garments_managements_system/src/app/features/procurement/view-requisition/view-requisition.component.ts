import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../../core/services/procurement.service';

@Component({
  selector: 'app-view-requisition',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0" *ngIf="!selectedReq">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-file-earmark-text me-2"></i>Purchase Requisitions</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>PR Date</th>
                  <th>Department</th>
                  <th>Order ID</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let req of requisitions">
                  <td>{{ req.prDate | date }}</td>
                  <td>{{ req.department }}</td>
                  <td>{{ req.orderId }}</td>
                  <td>{{ req.categoryName }}</td>
                  <td>
                    <span class="badge" [ngClass]="req.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'">
                      {{ req.status }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" (click)="viewDetails(req)">View Letter</button>
                  </td>
                </tr>
                <tr *ngIf="requisitions.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">No requisitions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Detail View / Requisition Letter -->
      <div class="card shadow-sm border-0" *ngIf="selectedReq">
        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between">
          <h5 class="mb-0 text-primary">Requisition Letter</h5>
          <button class="btn btn-sm btn-outline-secondary" (click)="selectedReq = null">Back to List</button>
        </div>
        <div class="card-body p-5">
          <div class="text-center mb-5 border-bottom pb-4">
            <h2 class="text-uppercase tracking-wider text-primary fw-bold">GARMENTS INC.</h2>
            <p class="text-muted mb-0">123 Fashion Street, Apparel District, Dhaka</p>
            <h4 class="mt-4 text-decoration-underline">PURCHASE REQUISITION</h4>
          </div>
          
          <div class="row mb-4">
            <div class="col-6">
              <p><strong>Date:</strong> {{ selectedReq.prDate | date:'longDate' }}</p>
              <p><strong>Department:</strong> {{ selectedReq.department }}</p>
            </div>
            <div class="col-6 text-end">
              <p><strong>Requested By:</strong> {{ selectedReq.requestedBy }}</p>
              <p><strong>Status:</strong> {{ selectedReq.status }}</p>
            </div>
          </div>

          <table class="table table-bordered mb-5">
            <thead class="table-light">
              <tr>
                <th>Order ID</th>
                <th>Category Name</th>
                <th class="text-end">Quantity</th>
                <th class="text-end">Est. Unit Price</th>
                <th class="text-end">Total Est. Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ selectedReq.orderId }}</td>
                <td>{{ selectedReq.categoryName }}</td>
                <td class="text-end">{{ selectedReq.quantity }}</td>
                <td class="text-end">{{ selectedReq.unitPrice | currency }}</td>
                <td class="text-end fw-bold">{{ selectedReq.totalPrice | currency }}</td>
              </tr>
            </tbody>
          </table>

          <div class="row mt-5 pt-5">
            <div class="col-4 text-center">
              <hr class="w-75 mx-auto border-dark">
              <p class="text-muted small">Prepared By</p>
            </div>
            <div class="col-4 text-center">
              <hr class="w-75 mx-auto border-dark">
              <p class="text-muted small">Checked By</p>
            </div>
            <div class="col-4 text-center">
              <hr class="w-75 mx-auto border-dark">
              <p class="text-muted small">Approved By</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewRequisitionComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  requisitions: any[] = [];
  selectedReq: any = null;

  ngOnInit() {
    this.procurementService.getRequisitions().subscribe(data => this.requisitions = data);
  }

  viewDetails(req: any) {
    this.selectedReq = req;
  }
}
