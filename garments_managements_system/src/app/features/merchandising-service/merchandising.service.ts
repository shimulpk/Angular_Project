import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api/api.service';
import { BOM, BOMItem } from '../../models/bom/bom.model';
import { Observable, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class MerchandisingService {
  private api = inject(ApiService);
  private endpoint = 'bomHeaders';

  getBOMs(params?: any): Observable<BOM[]> {
    return this.api.getAll<BOM>(this.endpoint, params);
  }

  getBOMById(id: string): Observable<BOM> {
    return this.api.getById<BOM>(this.endpoint, id);
  }

  /** Fetch the BOM header for a given style (returns the first matching BOM) */
  getBOMByStyleId(styleId: string): Observable<BOM | null> {
    return this.api.getAll<BOM>(this.endpoint, { styleId }).pipe(
      map(boms => boms.length > 0 ? boms[0] : null)
    );
  }

  /** Fetch standalone bomItems that reference a bomHeader by bomId */
  getBOMItems(bomId: string): Observable<BOMItem[]> {
    return this.api.getAll<BOMItem>('bomItems', { bomId });
  }

  /** Fetch all standalone bomItems */
  getAllBOMItems(): Observable<BOMItem[]> {
    return this.api.getAll<BOMItem>('bomItems');
  }

  createBOM(bom: BOM): Observable<BOM> {
    return this.api.create<BOM>(this.endpoint, bom);
  }
  
  createBOMItem(bomItem: BOMItem): Observable<BOMItem> {
    return this.api.create<BOMItem>('bomItems', bomItem);
  }

  updateBOM(id: string, bom: BOM): Observable<BOM> {
    return this.api.update<BOM>(this.endpoint, id, bom);
  }

  deleteBOM(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
  
  // --- UOM Methods ---
  getUOMs(): Observable<any[]> {
    return this.api.getAll<any>('uoms');
  }

  createUOM(uom: any): Observable<any> {
    return this.api.create<any>('uoms', uom);
  }

  updateUOM(id: string, uom: any): Observable<any> {
    return this.api.update<any>('uoms', id, uom);
  }

  deleteUOM(id: string): Observable<any> {
    return this.api.delete('uoms', id);
  }

  // --- Raw Materials Check Methods ---
  saveRawMaterialCheck(data: any): Observable<any> {
    return this.api.create<any>('rawMaterialChecks', data);
  }
}
