import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StyleService {
  private api = inject(ApiService);
  private endpoint = 'styles';

  getStyles(): Observable<any[]> {
    return this.api.getAll<any>(this.endpoint);
  }

  getStyleById(id: string): Observable<any> {
    return this.api.getById<any>(this.endpoint, id);
  }

  createStyle(style: any): Observable<any> {
    return this.api.create<any>(this.endpoint, style);
  }

  updateStyle(id: string, style: any): Observable<any> {
    return this.api.update<any>(this.endpoint, id, style);
  }

  deleteStyle(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
