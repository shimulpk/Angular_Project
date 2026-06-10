import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MerchandisingService } from '../../merchandising-service/merchandising.service';
import { StyleService } from '../../../core/services/style.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification/notification.service';
import { FabricRecord, FabricRecordDetail } from '../../../models/fabric-record/fabric-record.model';
import { BomStyle } from '../../../models/bom-style/bom-style.model';
import { forkJoin } from 'rxjs';

export interface OrderGroup {
  orderId: string;
  orderNumber: string;
  styleName: string;
  styleCode: string;
  records: FabricRecord[];
  totalFabric: number;
  latestDate: string;
}

@Component({
  selector: 'app-view-raw-material-check',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './view-raw-material-check.component.html',
  styleUrl: './view-raw-material-check.component.css'
})
export class ViewRawMaterialCheckComponent implements OnInit {
  private merchService = inject(MerchandisingService);
  private styleService = inject(StyleService);
  private orderService = inject(OrderService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  allRecords: FabricRecord[] = [];
  orderGroups: OrderGroup[] = [];
  filteredGroups: OrderGroup[] = [];

  styles: BomStyle[] = [];
  orders: any[] = [];

  searchOrderId: string = '';
  isLoading = true;

  // Edit modal state
  editModalOpen = false;
  editingRecord: FabricRecord | null = null;
  editTotalFabric: number = 0;

  // Delete confirm state
  deleteConfirmOpen = false;
  deletingRecord: FabricRecord | null = null;
  deletingGroupId: string = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    forkJoin({
      styles: this.styleService.getStyles(),
      orders: this.orderService.getOrders(),
      checks: this.merchService.getRawMaterialChecks()
    }).subscribe(({ styles, orders, checks }) => {
      this.styles = styles;
      this.orders = orders;
      this.allRecords = checks.sort((a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.buildGroups();
      this.isLoading = false;
    });
  }

  buildGroups(): void {
    const groupMap = new Map<string, OrderGroup>();

    for (const record of this.allRecords) {
      const resolvedOrderId = record.orderId || this.resolveOrderId(record.styleId);
      const resolvedOrderNumber = record.orderNumber || this.resolvePoNumber(record.styleId);
      const key = resolvedOrderId || 'unlinked';

      if (!groupMap.has(key)) {
        const style = this.styles.find(s => s.id === record.styleId);
        groupMap.set(key, {
          orderId: resolvedOrderId || 'N/A',
          orderNumber: resolvedOrderNumber || '—',
          styleName: style?.styleName || record.styleId,
          styleCode: style?.styleCode || '',
          records: [],
          totalFabric: 0,
          latestDate: record.date
        });
      }

      const group = groupMap.get(key)!;
      group.records.push({ ...record, orderId: resolvedOrderId, orderNumber: resolvedOrderNumber });
      group.totalFabric += record.totalFabricRequired ?? 0;

      if (new Date(record.date) > new Date(group.latestDate)) {
        group.latestDate = record.date;
      }
    }

    this.orderGroups = Array.from(groupMap.values());
    this.applyFilter();
  }

  resolveOrderId(styleId: string): string {
    const order = this.orders.find(o => o.styleId === styleId);
    return order ? (order.orderId || order.id) : '';
  }

  resolvePoNumber(styleId: string): string {
    const order = this.orders.find(o => o.styleId === styleId);
    return order ? (order.poNumber || order.orderId || '') : '';
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchOrderId.trim().toLowerCase();
    if (!term) {
      this.filteredGroups = [...this.orderGroups];
      return;
    }
    this.filteredGroups = this.orderGroups.filter(g =>
      g.orderId.toLowerCase().includes(term) ||
      g.orderNumber.toLowerCase().includes(term) ||
      g.styleName.toLowerCase().includes(term) ||
      g.styleCode.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchOrderId = '';
    this.applyFilter();
  }

  get totalRecordCount(): number {
    return this.filteredGroups.reduce((sum, g) => sum + g.records.length, 0);
  }

  navigateToNew(): void {
    this.router.navigate(['/raw-materials']);
  }

  // ── Delete ──────────────────────────────────────────────
  openDeleteConfirm(record: FabricRecord, groupOrderId: string): void {
    this.deletingRecord = record;
    this.deletingGroupId = groupOrderId;
    this.deleteConfirmOpen = true;
  }

  cancelDelete(): void {
    this.deleteConfirmOpen = false;
    this.deletingRecord = null;
    this.deletingGroupId = '';
  }

  confirmDelete(): void {
    if (!this.deletingRecord) return;
    this.merchService.deleteRawMaterialCheck(this.deletingRecord.id!).subscribe({
      next: () => {
        this.notify.success('Record deleted successfully.');
        this.deleteConfirmOpen = false;
        this.deletingRecord = null;
        this.loadData();
      },
      error: () => {
        this.notify.error('Failed to delete record. Please try again.');
        this.deleteConfirmOpen = false;
      }
    });
  }

  // ── Edit ─────────────────────────────────────────────────
  openEditModal(record: FabricRecord): void {
    this.editingRecord = { ...record, details: record.details ? [...record.details] : [] };
    this.editTotalFabric = record.totalFabricRequired;
    this.editModalOpen = true;
  }

  closeEditModal(): void {
    this.editModalOpen = false;
    this.editingRecord = null;
  }

  updateDetailQty(detail: FabricRecordDetail, event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    detail.qty = val >= 0 ? val : 0;
    detail.calculatedFabric = detail.baseFabric * detail.qty;
    this.recalcEditTotal();
  }

  recalcEditTotal(): void {
    if (!this.editingRecord) return;
    this.editTotalFabric = this.editingRecord.details.reduce(
      (sum, d) => sum + (d.calculatedFabric ?? 0), 0
    );
    this.editingRecord.totalFabricRequired = this.editTotalFabric;
  }

  saveEdit(): void {
    if (!this.editingRecord) return;
    const payload = { ...this.editingRecord, totalFabricRequired: this.editTotalFabric };
    this.merchService.updateRawMaterialCheck(this.editingRecord.id!, payload).subscribe({
      next: () => {
        this.notify.success('Record updated successfully.');
        this.editModalOpen = false;
        this.editingRecord = null;
        this.loadData();
      },
      error: () => {
        this.notify.error('Failed to update record. Please try again.');
      }
    });
  }
}
