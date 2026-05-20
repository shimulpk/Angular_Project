import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { QAInspection } from '../../../models/qa/qa.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class QAService {
  private api = inject(ApiService);
  private endpoint = 'qaInspections';

  getInspections(): Observable<QAInspection[]> {
    return this.api.getAll<QAInspection>(this.endpoint);
  }

  createInspection(data: QAInspection): Observable<QAInspection> {
    return this.api.create<QAInspection>(this.endpoint, data);
  }

  deleteInspection(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id);
  }
}
