import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcurementService {
  private api = inject(ApiService);

  // --- Vendors ---
  getVendors(): Observable<any[]> {
    return this.api.getAll<any>('vendors');
  }

  createVendor(vendor: any): Observable<any> {
    return this.api.create<any>('vendors', vendor);
  }

  // --- Items ---
  getItems(): Observable<any[]> {
    return this.api.getAll<any>('items');
  }

  createItem(item: any): Observable<any> {
    return this.api.create<any>('items', item);
  }

  // --- Stock Transactions ---
  getStockTransactions(): Observable<any[]> {
    return this.api.getAll<any>('stockTransactions');
  }

  createStockTransaction(transaction: any): Observable<any> {
    return this.api.create<any>('stockTransactions', transaction);
  }

  // --- Inventory List (Aggregated from items + transactions) ---
  // In a real app, backend would provide this. For json-server, we might do it client-side or use a specific endpoint.
  getInventory(): Observable<any[]> {
    return this.api.getAll<any>('inventoryItems');
  }
  
  createInventoryItem(item: any): Observable<any> {
    return this.api.create<any>('inventoryItems', item);
  }

  updateInventoryItem(id: string, item: any): Observable<any> {
    return this.api.update<any>('inventoryItems', id, item);
  }

  // --- Requisitions ---
  getRequisitions(): Observable<any[]> {
    return this.api.getAll<any>('requisitions');
  }

  getRequisitionById(id: string): Observable<any> {
    return this.api.getById<any>('requisitions', id);
  }

  createRequisition(requisition: any): Observable<any> {
    return this.api.create<any>('requisitions', requisition);
  }

  updateRequisition(id: string, requisition: any): Observable<any> {
    return this.api.update<any>('requisitions', id, requisition);
  }

  // --- Purchase Orders ---
  getPurchaseOrders(): Observable<any[]> {
    return this.api.getAll<any>('procurementPOs'); // To avoid collision with merchandising POs if necessary
  }

  createPurchaseOrder(po: any): Observable<any> {
    return this.api.create<any>('procurementPOs', po);
  }
}
