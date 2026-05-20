import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../core/services/api/api.service';
import { Observable } from 'rxjs';
export interface DashboardStats {
  totalOrders: number;
  activeProduction: number;
  shipmentsDue: number;
  lowStockItems: number;
  efficiency: number[];
  efficiencyLabels: string[];
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  time: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.getById<DashboardStats>('dashboardStats', ''); // json-server treats single objects differently but getById handles it if we pass empty id or use specific endpoint
    // Actually, for a single object in json-server, we usually just GET /dashboardStats
  }

  getDashboardData(): Observable<DashboardStats> {
    // In json-server, if dashboardStats is an object, we can just fetch it
    return this.api.getAll<DashboardStats>('dashboardStats') as unknown as Observable<DashboardStats>;
  }

  getActivities(): Observable<Activity[]> {
    return this.api.getAll<Activity>('activities');
  }
}
