import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Style } from '../../../models/style/style.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private api = inject(ApiService);
  private endpoint = 'styles';

  getStyles(params?: any): Observable<Style[]> {
    return this.api.getAll<Style>(this.endpoint, params);
  }

  getStyleById(id: string): Observable<Style> {
    return this.api.getById<Style>(this.endpoint, id);
  }

  createStyle(style: Style): Observable<Style> {
    return this.api.create<Style>(this.endpoint, style);
  }

  updateStyle(id: string, style: Style): Observable<Style> {
    return this.api.update<Style>(this.endpoint, id, style);
  }

  deleteStyle(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
