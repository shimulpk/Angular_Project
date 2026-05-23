import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QAService } from '../qa-service/qa.service';
import { QAInspection } from '../../../models/qa/qa.model';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
@Component({
  selector: 'app-qa-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './qa-dashboard.component.html',
  styleUrl: './qa-dashboard.component.css'})
export class QADashboardComponent implements OnInit {
  private qaService = inject(QAService);

  inspections: QAInspection[] = [];
  avgDHU = 0;
  passRate = 0;
  totalRework = 0;
  totalReject = 0;

  // Chart
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: ['Broken Stitch', 'Oil Stain', 'Measurement', 'Color Shade'],
    datasets: [{
      data: [35, 20, 15, 30],
      backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
    }]
  };
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' }
    }
  };
  public pieChartType: ChartType = 'pie';

  ngOnInit() {
    this.loadInspections();
  }

  loadInspections() {
    this.qaService.getInspections().subscribe((data: QAInspection[]) => {
      this.inspections = data;
      this.calculateSummary();
    });
  }

  calculateSummary() {
    if (this.inspections.length === 0) return;
    
    let totalCheck = 0;
    let totalPass = 0;
    let totalDHU = 0;
    let totalRework = 0;
    let totalReject = 0;
    
    this.inspections.forEach(i => {
      totalCheck += i.checkQty;
      totalPass += i.passQty;
      totalDHU += i.dhu;
      totalRework += i.reworkQty || 0;
      totalReject += i.rejectQty || 0;
    });
    
    this.passRate = (totalPass / totalCheck) * 100;
    this.avgDHU = totalDHU / this.inspections.length;
    this.totalRework = totalRework;
    this.totalReject = totalReject;
  }
}
