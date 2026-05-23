import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard-service/dashboard.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './dashboard.component.css'
})
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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
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
