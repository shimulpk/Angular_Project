import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { BOM } from '../../../models/bom/bom.model';
import { Observable } from 'rxjs';
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

  createBOM(bom: BOM): Observable<BOM> {
    return this.api.create<BOM>(this.endpoint, bom);
  }

  updateBOM(id: string, bom: BOM): Observable<BOM> {
    return this.api.update<BOM>(this.endpoint, id, bom);
  }

  deleteBOM(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
