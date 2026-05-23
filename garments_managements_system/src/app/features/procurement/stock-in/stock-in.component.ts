import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-stock-in',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-success text-white border-0 py-3">
          <h5 class="mb-0"><i class="bi bi-arrow-down-square me-2"></i>Stock In</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="stockForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Item</label>
                <select class="form-select" formControlName="inventoryItemId">
                  <option value="">Select Item</option>
                  <option *ngFor="let item of inventoryItems" [value]="item.id">
                    {{ item.itemName }} ({{ item.category }})
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
              <button type="submit" class="btn btn-success px-4" [disabled]="stockForm.invalid">Add Stock</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class StockInComponent implements OnInit {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  inventoryItems: any[] = [];
  
  stockForm: FormGroup = this.fb.group({
    inventoryItemId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    date: ['', Validators.required],
    type: ['IN']
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
      
      // Update inventory quantity
      const invItem = this.inventoryItems.find(i => i.id === formValue.inventoryItemId);
      if (!invItem) return;

      const newQty = (invItem.quantity || 0) + formValue.quantity;

      this.procurementService.updateInventoryItem(invItem.id, { ...invItem, quantity: newQty }).pipe(
        switchMap(() => this.procurementService.createStockTransaction({
          ...formValue,
          itemName: invItem.itemName
        }))
      ).subscribe(() => {
        this.notify.success('Stock added successfully');
        this.stockForm.reset({ type: 'IN' });
        this.loadInventory();
      });
    }
  }
}
