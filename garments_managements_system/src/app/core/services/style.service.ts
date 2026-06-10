import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable } from 'rxjs';
import { BomStyle } from '../../models/bom-style/bom-style.model';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private api = inject(ApiService);
  private endpoint = 'bomStyles';

  getStyles(): Observable<BomStyle[]> {
    return this.api.getAll<BomStyle>(this.endpoint);
  }

  getStyleById(id: string): Observable<BomStyle> {
    return this.api.getById<BomStyle>(this.endpoint, id);
  }

  createStyle(style: BomStyle): Observable<BomStyle> {
    return this.api.create<BomStyle>(this.endpoint, style);
  }

  updateStyle(id: string, style: BomStyle): Observable<BomStyle> {
    return this.api.update<BomStyle>(this.endpoint, id, style);
  }

  deleteStyle(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
