import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InventoryService } from '../inventory-service/inventory.service';
import { InventoryItem } from '../../../models/inventory-item/inventory-item.model';
import { InventoryTransaction } from '../../../models/inventory-transaction/inventory-transaction.model';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
@Component({
  selector: 'app-inventory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inventory-form.component.html',
  styleUrl: './inventory-form.component.css'})
export class InventoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private invService = inject(InventoryService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private authService = inject(AuthService);

  transactionForm!: FormGroup;
  inventory: InventoryItem[] = [];

  ngOnInit() {
    this.initForm();
    this.loadInventory();
  }

  initForm() {
    this.transactionForm = this.fb.group({
      itemId: ['', Validators.required],
      itemName: [''],
      type: ['RECEIPT', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.1)]],
      referenceNo: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      remarks: ['']
    });
  }

  loadInventory() {
    this.invService.getInventory().subscribe((data: InventoryItem[]) => this.inventory = data);
  }

  onItemSelect() {
    const id = this.transactionForm.get('itemId')?.value;
    const item = this.inventory.find(i => i.id === id);
    if (item) this.transactionForm.patchValue({ itemName: item.item });
  }

  save() {
    if (this.transactionForm.valid) {
      const trans = this.transactionForm.value;
      const user = this.authService.currentUserValue;
      if (trans.type === 'ADJUSTMENT' && user?.role !== 'ADMIN' && user?.role !== 'STOREKEEPER') {
        this.notify.error('Stock adjustment is restricted to ADMIN or STOREKEEPER roles.');
        return;
      }
      this.invService.processTransaction(trans).subscribe(() => {
        this.notify.success('Inventory updated successfully');
        this.router.navigate(['/inventory']);
      });
    }
  }
}
