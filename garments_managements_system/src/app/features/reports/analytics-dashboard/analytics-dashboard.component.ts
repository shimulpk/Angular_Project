import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportService } from '../report-service/report.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.css'})
export class AnalyticsDashboardComponent implements OnInit {
  private reportService = inject(ReportService);

  kpis = [
    { label: 'Total Revenue', value: '$428,500', trend: 12, color: 'text-primary' },
    { label: 'Avg. Efficiency', value: '88.4%', trend: 4, color: 'text-success' },
    { label: 'On-Time Delivery', value: '96.2%', trend: 1.5, color: 'text-info' },
    { label: 'Inventory Value', value: '$63,400', trend: 8, color: 'text-warning' }
  ];

  // Line Chart
  public lineChartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { data: [65, 59, 80, 81, 56, 95], label: 'Orders (k$)', borderColor: '#0d6efd', tension: 0.4, fill: true, backgroundColor: 'rgba(13, 110, 253, 0.1)' },
      { data: [28, 48, 40, 19, 86, 77], label: 'Production (k)', borderColor: '#10b981', tension: 0.4 }
    ]
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } }
  };
  public lineChartType: ChartType = 'line';

  // Doughnut Chart
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Fabric', 'Trims', 'Packaging'],
    datasets: [{ data: [300, 50, 100], backgroundColor: ['#0d6efd', '#10b981', '#f59e0b'] }]
  };
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };
  public doughnutChartType: ChartType = 'doughnut';

  ngOnInit() {
    // In real app, load data from reportService
  }
}
