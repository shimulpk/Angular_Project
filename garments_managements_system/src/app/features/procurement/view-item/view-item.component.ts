import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcurementService } from '../../../core/services/procurement.service';

@Component({
  selector: 'app-view-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-boxes me-2"></i>Item Master List</h5>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td class="fw-medium">{{ item.itemName }}</td>
                  <td><span class="badge bg-secondary">{{ item.category }}</span></td>
                  <td>{{ item.unit }}</td>
                </tr>
                <tr *ngIf="items.length === 0">
                  <td colspan="3" class="text-center py-4 text-muted">No items found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ViewItemComponent implements OnInit {
  private procurementService = inject(ProcurementService);
  items: any[] = [];

  ngOnInit() {
    this.procurementService.getItems().subscribe(data => this.items = data);
  }
}
