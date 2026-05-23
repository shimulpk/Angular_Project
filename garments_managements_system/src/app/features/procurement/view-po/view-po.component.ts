import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../../core/services/procurement.service';

@Component({
  selector: 'app-view-po',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0" *ngIf="!selectedPo">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-cart me-2"></i>Purchase Orders List</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>PO Number</th>
                  <th>PO Date</th>
                  <th>Vendor</th>
                  <th>Delivery Date</th>
                  <th>Total Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let po of purchaseOrders">
                  <td class="fw-bold text-primary">{{ po.poNumber }}</td>
                  <td>{{ po.poDate | date }}</td>
                  <td>{{ po.vendorName || po.vendorId }}</td>
                  <td>{{ po.deliveryDate | date }}</td>
                  <td class="fw-medium">{{ po.totalPrice | currency }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info" (click)="viewDetails(po)">View PO</button>
                  </td>
                </tr>
                <tr *ngIf="purchaseOrders.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">No Purchase Orders found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Detail View / PO Document -->
      <div class="card shadow-sm border-0" *ngIf="selectedPo">
        <div class="card-header bg-light border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><i class="bi bi-file-text me-2"></i>Purchase Order: {{ selectedPo.poNumber }}</h5>
          <div>
            <button class="btn btn-sm btn-primary me-2"><i class="bi bi-printer me-1"></i> Print</button>
            <button class="btn btn-sm btn-outline-secondary" (click)="selectedPo = null">Back</button>
          </div>
        </div>
        <div class="card-body p-5">
          <div class="row mb-5 pb-4 border-bottom">
            <div class="col-sm-6">
              <h2 class="text-primary fw-bold mb-3">GARMENTS INC.</h2>
              <address>
                <strong>Corporate Office</strong><br>
                123 Fashion Street<br>
                Apparel District, Dhaka<br>
                Phone: +880 123 456 7890
              </address>
            </div>
            <div class="col-sm-6 text-end">
              <h3 class="text-uppercase text-muted">Purchase Order</h3>
              <p class="mb-1"><strong>PO #:</strong> {{ selectedPo.poNumber }}</p>
              <p class="mb-1"><strong>Date:</strong> {{ selectedPo.poDate | date }}</p>
              <p class="mb-1"><strong>Delivery Date:</strong> {{ selectedPo.deliveryDate | date }}</p>
              <p class="mb-0"><strong>Status:</strong> <span class="badge bg-info text-dark">{{ selectedPo.status }}</span></p>
            </div>
          </div>

          <div class="row mb-5">
            <div class="col-sm-6">
              <h6 class="text-muted text-uppercase mb-3">Vendor Information</h6>
              <address>
                <strong>{{ selectedPo.vendorName || 'Vendor #' + selectedPo.vendorId }}</strong><br>
                Phone: {{ selectedPo.vendorPhone || 'N/A' }}<br>
              </address>
            </div>
          </div>

          <table class="table table-bordered mb-5">
            <thead class="table-light">
              <tr>
                <th>Product Name</th>
                <th class="text-end">Quantity</th>
                <th class="text-end">Unit Price</th>
                <th class="text-end">Tax (%)</th>
                <th class="text-end">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ selectedPo.productName }} <br><small class="text-muted">Req ID: {{ selectedPo.requisitionId }}</small></td>
                <td class="text-end">{{ selectedPo.quantity }}</td>
                <td class="text-end">{{ selectedPo.unitPrice | currency }}</td>
                <td class="text-end">{{ selectedPo.taxPercent }}%</td>
                <td class="text-end fw-bold">{{ selectedPo.totalPrice | currency }}</td>
              </tr>
            </tbody>
          </table>

          <div class="row">
            <div class="col-lg-4 col-sm-5 ms-auto">
              <table class="table table-clear">
                <tbody>
                  <tr>
                    <td class="left"><strong>Subtotal</strong></td>
                    <td class="right">{{ (selectedPo.quantity * selectedPo.unitPrice) | currency }}</td>
                  </tr>
                  <tr>
                    <td class="left"><strong>Tax ({{ selectedPo.taxPercent }}%)</strong></td>
                    <td class="right">{{ ((selectedPo.quantity * selectedPo.unitPrice) * (selectedPo.taxPercent / 100)) | currency }}</td>
                  </tr>
                  <tr>
                    <td class="left"><strong>Total</strong></td>
                    <td class="right"><strong>{{ selectedPo.totalPrice | currency }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-5 pt-5 text-center text-muted">
            <p>Authorized Signature: _______________________</p>
            <p class="small">This is a system generated purchase order.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewPoComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  purchaseOrders: any[] = [];
  selectedPo: any = null;

  ngOnInit() {
    this.procurementService.getPurchaseOrders().subscribe(data => this.purchaseOrders = data);
  }

  viewDetails(po: any) {
    this.selectedPo = po;
  }
}
