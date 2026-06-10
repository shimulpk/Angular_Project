import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/services/api/api.service';
import { BomView } from '../../models/bom-view/bom-view.model';
import { Uom } from '../../models/uom/uom.model';
import { RawMaterialCheck } from '../../models/raw-material-check/raw-material-check.model';
import { FabricRecord } from '../../models/fabric-record/fabric-record.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MerchandisingService {
  private api = inject(ApiService);

  // --- Uom Methods ---
  getUOMs(): Observable<Uom[]> {
    return this.api.getAll<Uom>('uoms');
  }

  createUOM(uom: Uom): Observable<Uom> {
    return this.api.create<Uom>('uoms', uom);
  }

  updateUOM(id: string, uom: Uom): Observable<Uom> {
    return this.api.update<Uom>('uoms', id, uom);
  }

  deleteUOM(id: string): Observable<any> {
    return this.api.delete('uoms', id);
  }

  // --- BomView Methods ---
  getAllBOMItems(): Observable<BomView[]> {
    return this.api.getAll<BomView>('bomViews');
  }

  createBOMItem(bomView: BomView): Observable<BomView> {
    return this.api.create<BomView>('bomViews', bomView);
  }

  updateBOMItem(id: string, bomView: BomView): Observable<BomView> {
    return this.api.update<BomView>('bomViews', id, bomView);
  }

  deleteBOMItem(id: string): Observable<any> {
    return this.api.delete('bomViews', id);
  }

  // --- RawMaterialCheck Methods ---
  saveRawMaterialCheck(data: RawMaterialCheck): Observable<RawMaterialCheck> {
    return this.api.create<RawMaterialCheck>('rawMaterialChecks', data);
  }

  getRawMaterialChecks(): Observable<RawMaterialCheck[]> {
    return this.api.getAll<RawMaterialCheck>('rawMaterialChecks');
  }

  updateRawMaterialCheck(id: string, data: RawMaterialCheck): Observable<RawMaterialCheck> {
    return this.api.update<RawMaterialCheck>('rawMaterialChecks', id, data);
  }

  deleteRawMaterialCheck(id: string): Observable<any> {
    return this.api.delete('rawMaterialChecks', id);
  }

  // --- FabricRecord Methods ---
  getFabricRecords(): Observable<FabricRecord[]> {
    return this.api.getAll<FabricRecord>('fabricRecords');
  }

  createFabricRecord(data: FabricRecord): Observable<FabricRecord> {
    return this.api.create<FabricRecord>('fabricRecords', data);
  }

  updateFabricRecord(id: string, data: FabricRecord): Observable<FabricRecord> {
    return this.api.update<FabricRecord>('fabricRecords', id, data);
  }

  deleteFabricRecord(id: string): Observable<any> {
    return this.api.delete('fabricRecords', id);
  }
}
