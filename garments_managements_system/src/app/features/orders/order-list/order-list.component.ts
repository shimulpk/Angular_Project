import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../order-service/order.service';
import { Order } from '../../../models/order/order.model';
import { ReusableTableComponent, TableColumn } from '../../../shared/components/reusable-table/reusable-table.component';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReusableTableComponent],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm = '';
  statusFilter = '';

  columns: TableColumn[] = [
    { key: 'poNumber', label: 'PO Number' },
    { key: 'orderDate', label: 'Order Date', type: 'date' },
    { key: 'shipDate', label: 'Ship Date', type: 'date' },
    { key: 'totalQuantity', label: 'Total Qty' },
    { key: 'totalAmount', label: 'Amount ($)' },
    { 
      key: 'status', 
      label: 'Status', 
      type: 'badge',
      badgeClass: (val) => {
        switch(val) {
          case 'DRAFT': return 'bg-light text-dark border';
          case 'CONFIRMED': return 'bg-info';
          case 'IN_PRODUCTION': return 'bg-primary';
          case 'SHIPPED': return 'bg-success';
          default: return 'bg-secondary';
        }
      }
    }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(data => {
      this.orders = data;
      this.filteredOrders = data;
    });
  }

  filterOrders() {
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = o.poNumber.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || o.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  viewOrder(order: Order) {
    this.router.navigate(['/orders', order.id]);
  }

  editOrder(order: Order) {
    this.router.navigate(['/orders/edit', order.id]);
  }

  deleteOrder(order: Order) {
    if (confirm(`Delete PO ${order.poNumber}?`)) {
      this.orderService.deleteOrder(order.id!).subscribe(() => this.loadOrders());
    }
  }
}
