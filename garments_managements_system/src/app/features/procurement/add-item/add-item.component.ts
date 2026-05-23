import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProcurementService } from '../../../core/services/procurement.service';
import { NotificationService } from '../../../core/services/notification/notification.service';

@Component({
  selector: 'app-add-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="card shadow-sm border-0">
        <div class="card-header bg-white border-0 py-3">
          <h5 class="mb-0 text-primary"><i class="bi bi-box-seam me-2"></i>Add Item</h5>
        </div>
        <div class="card-body">
          <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Item Name</label>
                <input type="text" class="form-control" formControlName="itemName" placeholder="E.g. Cotton Fabric">
              </div>
              <div class="col-md-4">
                <label class="form-label">Category</label>
                <select class="form-select" formControlName="category">
                  <option value="">Select Category</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Trims">Trims</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Packaging">Packaging</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Unit</label>
                <select class="form-select" formControlName="unit">
                  <option value="">Select Unit</option>
                  <option value="Kg">Kg</option>
                  <option value="Yards">Yards</option>
                  <option value="Meters">Meters</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Cones">Cones</option>
                  <option value="Rolls">Rolls</option>
                </select>
              </div>
            </div>
            <div class="mt-4 text-end">
              <button type="submit" class="btn btn-primary px-4" [disabled]="itemForm.invalid">Save Item</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class AddItemComponent {
  private fb = inject(FormBuilder);
  private procurementService = inject(ProcurementService);
  private notify = inject(NotificationService);

  itemForm: FormGroup = this.fb.group({
    itemName: ['', Validators.required],
    category: ['', Validators.required],
    unit: ['', Validators.required]
  });

  onSubmit() {
    if (this.itemForm.valid) {
      // Also sync it as an inventory item initially with 0 quantity if needed, or just keep as item definition
      this.procurementService.createItem(this.itemForm.value).subscribe(item => {
        // Automatically create a 0-quantity entry in inventory list
        this.procurementService.createInventoryItem({
          itemName: item.itemName,
          category: item.category,
          unit: item.unit,
          quantity: 0
        }).subscribe(() => {
          this.notify.success('Item added successfully');
          this.itemForm.reset();
        });
      });
    }
  }
}
