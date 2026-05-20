import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../inventory-service/inventory.service';
import { InventoryItem } from '../../../models/inventory-item/inventory-item.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './inventory-dashboard.component.html',
  styleUrl: './inventory-dashboard.component.css'})
export class InventoryDashboardComponent implements OnInit {
  private invService = inject(InventoryService);

  inventory: InventoryItem[] = [];
  filteredInventory: InventoryItem[] = [];
  lowStockItems: InventoryItem[] = [];
  searchTerm = '';
  totalStock = 0;
  totalReserved = 0;

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.invService.getInventory().subscribe((data: InventoryItem[]) => {
      this.inventory = data;
      this.filteredInventory = data;
      this.calculateSummary();
    });
  }

  calculateSummary() {
    this.totalStock = this.inventory.reduce((sum, item) => sum + item.qtyOnHand, 0);
    this.totalReserved = this.inventory.reduce((sum, item) => sum + item.qtyReserved, 0);
    this.lowStockItems = this.inventory.filter(item => item.qtyAvailable <= item.reorderLevel);
  }

  filterInventory() {
    this.filteredInventory = this.inventory.filter(i => 
      i.item.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
