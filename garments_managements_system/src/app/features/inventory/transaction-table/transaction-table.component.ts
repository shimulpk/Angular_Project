import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../inventory-service/inventory.service';
import { InventoryTransaction } from '../../../models/inventory-transaction/inventory-transaction.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-transaction-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-table.component.html',
  styleUrl: './transaction-table.component.css'})
export class TransactionTableComponent implements OnInit {
  private invService = inject(InventoryService);

  transactions: InventoryTransaction[] = [];

  ngOnInit() {
    this.invService.getTransactions().subscribe((data: InventoryTransaction[]) => this.transactions = data.reverse());
  }

  getTypeClass(type: string) {
    return 'bg-type-' + type.toLowerCase();
  }
}
