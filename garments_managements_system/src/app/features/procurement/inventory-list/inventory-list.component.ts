import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../../core/services/procurement.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
          <h5 class="mb-0 text-primary"><i class="bi bi-list-ul me-2"></i>Current Inventory</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Category</th>
                  <th>Item Name</th>
                  <th>Current Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of inventoryItems">
                  <td><span class="badge bg-info text-dark">{{ item.category }}</span></td>
                  <td class="fw-medium">{{ item.itemName }}</td>
                  <td [ngClass]="{'text-danger fw-bold': (item.quantity || 0) === 0}">
                    {{ item.quantity || 0 }}
                  </td>
                  <td>{{ item.unit }}</td>
                </tr>
                <tr *ngIf="inventoryItems.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">No inventory items found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryListComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  inventoryItems: any[] = [];

  ngOnInit() {
    this.procurementService.getInventory().subscribe(data => this.inventoryItems = data);
  }
}
