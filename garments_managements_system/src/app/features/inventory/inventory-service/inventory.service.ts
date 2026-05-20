import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { InventoryItem } from '../../../models/inventory-item/inventory-item.model';
import { InventoryTransaction } from '../../../models/inventory-transaction/inventory-transaction.model';
import { Observable, switchMap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private api = inject(ApiService);

  getInventory(): Observable<InventoryItem[]> {
    return this.api.getAll<InventoryItem>('inventory');
  }

  getTransactions(): Observable<InventoryTransaction[]> {
    return this.api.getAll<InventoryTransaction>('inventoryTransactions');
  }

  processTransaction(transaction: InventoryTransaction): Observable<any> {
    // 1. Create the transaction record
    return this.api.create<InventoryTransaction>('inventoryTransactions', transaction).pipe(
      switchMap(() => {
        // 2. Update the stock quantity on the inventory item
        return this.api.getById<InventoryItem>('inventory', transaction.itemId).pipe(
          switchMap(item => {
            let newQty = item.qtyOnHand;
            if (transaction.type === 'RECEIPT' || transaction.type === 'RETURN') {
              newQty += transaction.quantity;
            } else if (transaction.type === 'ISSUE' || transaction.type === 'ADJUSTMENT') {
              newQty -= transaction.quantity;
            }
            
            return this.api.update<InventoryItem>('inventory', item.id!, {
              ...item,
              qtyOnHand: newQty,
              qtyAvailable: newQty - item.qtyReserved
            });
          })
        );
      })
    );
  }
}
