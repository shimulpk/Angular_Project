import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard-service/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = '';
  @Input() color: string = 'primary';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, BaseChartDirective],
  template: `
    <div class="container-fluid">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-0">Executive Overview</h3>
          <p class="text-muted small mb-0">Real-time intelligence from your manufacturing floor</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-white bg-white border shadow-sm btn-sm px-3">
            <i class="bi bi-download me-2"></i> Report
          </button>
          <button class="btn btn-primary btn-sm px-3 shadow-sm">
            <i class="bi bi-plus-lg me-2"></i> New PO
          </button>
        </div>
      </div>

      <!-- KPI Row -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <app-kpi-card title="Active Orders" [value]="stats?.totalOrders || 0" icon="bi-cart" color="primary"></app-kpi-card>
        </div>
        <div class="col-md-3">
          <app-kpi-card title="On-Floor Prod." [value]="stats?.activeProduction || 0" icon="bi-gear" color="success"></app-kpi-card>
        </div>
        <div class="col-md-3">
          <app-kpi-card title="Shipments Due" [value]="stats?.shipmentsDue || 0" icon="bi-truck" color="warning"></app-kpi-card>
        </div>
        <div class="col-md-3">
          <app-kpi-card title="Quality DHU" value="3.2%" icon="bi-shield-check" color="danger"></app-kpi-card>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header bg-white d-flex justify-content-between align-items-center border-0 py-3">
              <h5 class="mb-0 fw-bold">Production Efficiency Trend</h5>
            </div>
            <div class="card-body">
              <div style="height: 300px;">
                <canvas baseChart
                  [data]="lineChartData"
                  [options]="lineChartOptions"
                  [type]="lineChartType">
                </canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header bg-white border-0 py-3">
              <h5 class="mb-0 fw-bold">Recent Activities</h5>
            </div>
            <div class="card-body p-0">
              <div class="activity-feed p-4">
                <div *ngFor="let act of activities" class="activity-item d-flex mb-4">
                  <div class="activity-icon-container me-3">
                    <div class="activity-icon bg-{{ act.color }} bg-opacity-10 text-{{ act.color }} rounded-circle">
                      <i class="bi" [ngClass]="act.type === 'ORDER' ? 'bi-cart' : 'bi-gear'"></i>
                    </div>
                  </div>
                  <div class="activity-content">
                    <div class="d-flex justify-content-between mb-1">
                      <h6 class="fw-bold mb-0 small">{{ act.title }}</h6>
                      <span class="x-small text-muted">{{ act.time }}</span>
                    </div>
                    <p class="text-muted small mb-0">{{ act.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .activity-icon {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    .x-small { font-size: 0.7rem; }
  `]
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  stats: any;
  activities: any[] = [];

  public lineChartData: ChartData<'line'> = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [82, 85, 84, 88, 86, 90, 89],
      label: 'Efficiency (%)',
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100, grid: { display: false } },
      x: { grid: { display: false } }
    }
  };

  public lineChartType: ChartType = 'line';

  ngOnInit() {
    this.dashboardService.getStats().subscribe((data: any) => this.stats = data);
    this.dashboardService.getActivities().subscribe((data: any[]) => this.activities = data);
  }
}
