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
      <div class="card shadow-sm border-0">
        <div class="card-header bg-danger text-white border-0 py-3">
          <h5 class="mb-0"><i class="bi bi-arrow-up-square me-2"></i>Stock Out</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="stockForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Item</label>
                <select class="form-select" formControlName="inventoryItemId">
                  <option value="">Select Item</option>
                  <option *ngFor="let item of inventoryItems" [value]="item.id">
                    {{ item.itemName }} (Avail: {{ item.quantity || 0 }})
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Quantity</label>
                <input type="number" class="form-control" formControlName="quantity" min="1">
              </div>
              <div class="col-md-4">
                <label class="form-label">Date</label>
                <input type="date" class="form-control" formControlName="date">
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-danger px-4" [disabled]="stockForm.invalid">Deduct Stock</button>
            </div>
          </form>
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
  
  stockForm: FormGroup = this.fb.group({
    inventoryItemId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    date: ['', Validators.required],
    type: ['OUT']
  });

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.procurementService.getInventory().subscribe(data => this.inventoryItems = data);
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
          itemName: invItem.itemName
        }))
      ).subscribe(() => {
        this.notify.success('Stock deducted successfully');
        this.stockForm.reset({ type: 'OUT' });
        this.loadInventory();
      });
    }
  }
}
