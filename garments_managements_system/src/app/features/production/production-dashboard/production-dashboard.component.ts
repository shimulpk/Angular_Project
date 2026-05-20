import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductionService } from '../production-service/production.service';
import { Production } from '../../../models/production/production.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-production-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './production-dashboard.component.html',
  styleUrl: './production-dashboard.component.css'})
export class ProductionDashboardComponent implements OnInit {
  private prodService = inject(ProductionService);

  stages = ['CUTTING', 'SEWING', 'FINISHING', 'PACKING'];
  trackingData: Production[] = [];

  ngOnInit() {
    this.loadTracking();
  }

  loadTracking() {
    this.prodService.getProductionTracking().subscribe((data: Production[]) => {
      this.trackingData = data;
    });
  }

  getOrdersInStage(stage: string): Production[] {
    return this.trackingData.filter(p => p.stage === stage);
  }

  calculateProgress(prod: Production): number {
    if (!prod.targetQty) return 0;
    return Math.round((prod.actualQty / prod.targetQty) * 100);
  }

  getStatusClass(status: string) {
    return 'status-' + status.toLowerCase().replace(' ', '-');
  }
}
