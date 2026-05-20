import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  getAll<T>(endpoint: string, params?: any): Observable<T[]> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  getById<T>(endpoint: string, id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`);
  }

  create<T>(endpoint: string, data: T): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data);
  }

  update<T>(endpoint: string, id: string | number, data: T): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${endpoint}/${id}`);
  }
}
