import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-stock-out',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Stock Out Form -->
        <div class="col-lg-5">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-danger text-white border-0 py-3">
              <h5 class="mb-0"><i class="bi bi-arrow-up-square me-2"></i>Stock Out Entry</h5>
            </div>
            <div class="card-body">
              <form [formGroup]="stockForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Item</label>
                  <select class="form-select" formControlName="inventoryItemId">
                    <option value="">Select Item</option>
                    <option *ngFor="let item of inventoryItems" [value]="item.id">
                      {{ item.itemName }} (Avail: {{ item.quantity || 0 }})
                    </option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">Quantity</label>
                  <input type="number" class="form-control" formControlName="quantity" min="1">
                </div>
                <div class="mb-3">
                  <label class="form-label">Date</label>
                  <input type="date" class="form-control" formControlName="date">
                </div>
                <div class="mt-4 text-end">
                  <button type="submit" class="btn btn-danger w-100" [disabled]="stockForm.invalid">Deduct Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Stock Out History List -->
        <div class="col-lg-7">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <h5 class="mb-0 text-danger"><i class="bi bi-list-stars me-2"></i>Stock Out History</h5>
              <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2">
                Total Entries: {{ transactions.length }}
              </span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive" style="max-height: 450px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th class="px-4">Item Name</th>
                      <th>Quantity</th>
                      <th class="px-4">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let t of transactions">
                      <td class="px-4 fw-medium">{{ t.itemName }}</td>
                      <td>
                        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                          -{{ t.quantity }}
                        </span>
                      </td>
                      <td class="px-4 text-muted small">
                        {{ (t.timestamp | date:'medium') || (t.date | date:'mediumDate') }}
                      </td>
                    </tr>
                    <tr *ngIf="transactions.length === 0">
                      <td colspan="3" class="text-center py-5 text-muted">
                        <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                        No stock exits recorded.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StockOutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  inventoryItems: any[] = [];
  transactions: any[] = [];
  
  stockForm: FormGroup = this.fb.group({
    inventoryItemId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    type: ['OUT']
  });

  ngOnInit() {
    this.loadInventory();
    this.loadTransactions();
  }

  loadInventory() {
    this.procurementService.getInventory().subscribe(data => this.inventoryItems = data);
  }

  loadTransactions() {
    this.procurementService.getStockTransactions().subscribe(data => {
      this.transactions = data.filter(t => t.type === 'OUT').reverse();
    });
  }

  onSubmit() {
    if (this.stockForm.valid) {
      const formValue = this.stockForm.value;
      
      const invItem = this.inventoryItems.find(i => i.id === formValue.inventoryItemId);
      if (!invItem) return;

      const newQty = (invItem.quantity || 0) - formValue.quantity;
      if (newQty < 0) {
        this.notify.error('Insufficient stock available!');
        return;
      }

      this.procurementService.updateInventoryItem(invItem.id, { ...invItem, quantity: newQty }).pipe(
        switchMap(() => this.procurementService.createStockTransaction({
          ...formValue,
          itemName: invItem.itemName,
          timestamp: new Date().toISOString()
        }))
      ).subscribe(() => {
        this.notify.success('Stock deducted successfully');
        this.stockForm.reset({
          inventoryItemId: '',
          quantity: 0,
          date: new Date().toISOString().substring(0, 10),
          type: 'OUT'
        });
        this.loadInventory();
        this.loadTransactions();
      });
    }
  }
}
