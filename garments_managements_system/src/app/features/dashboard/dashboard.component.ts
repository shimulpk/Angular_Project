import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ProductionPlanningService } from '../production-planning/production-planning.service';
import { OrderService } from '../../core/services/order.service';
import { BuyerService } from '../../core/services/buyer.service';
import { ApiService } from '../../core/services/api/api.service';

// ── Reusable KPI Card ────────────────────────────────────────────────────────
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
  @Input() todayValue: string | number | null = null;
  @Input() todayLabel: string = "Today's";
  @Input() lifetimeLabel: string = 'Lifetime';
}

// ── Main Dashboard Component ─────────────────────────────────────────────────
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private svc    = inject(ProductionPlanningService);
  private orders = inject(OrderService);
  private buyers = inject(BuyerService);
  private api    = inject(ApiService);

  loading = true;
  todayStr = new Date().toISOString().substring(0, 10);

  // ── KPI Metrics ─────────────────────────────────────────────────────────
  kpi = {
    totalBuyers:    0,
    totalSuppliers: 0,
    activeOrders:   0,
    todayCut:       0,
    totalCut:       0,
    todaySewn:      0,
    totalSewn:      0,
    todayFinished:  0,
    totalFinished:  0,
    todayPacked:    0,
    totalPacked:    0,
  };

  // ── Alerts ───────────────────────────────────────────────────────────────
  alerts: { type: 'danger' | 'warning'; icon: string; title: string; message: string }[] = [];

  // ── Active Orders Table ──────────────────────────────────────────────────
  activeOrderRows: any[] = [];

  // ── Chart 1: Today's Section Donut ──────────────────────────────────────
  public donutData: ChartData<'doughnut'> = {
    labels: ['Cutting', 'Sewing', 'Finishing', 'Packing'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ['#1e3a5f', '#7c3aed', '#f59e0b', '#10b981'],
      hoverOffset: 6,
      borderWidth: 2
    }]
  };
  public donutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 } } },
      tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed} pcs` } }
    }
  };
  public donutType: ChartType = 'doughnut';

  // ── Chart 2: Last 7 Days Production Trend ───────────────────────────────
  public trendData: any = {
    labels: [],
    datasets: [
      {
        type: 'bar',
        data: [],
        label: 'Sewing Output',
        backgroundColor: 'rgba(124,58,237,0.7)',
        borderRadius: 6,
        order: 2
      },
      {
        type: 'line',
        data: [],
        label: 'Cutting Output',
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30,58,95,0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#1e3a5f',
        order: 1
      }
    ]
  };
  public trendOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 12 }, padding: 16 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' } },
      x: { grid: { display: false } }
    }
  };
  public trendType: ChartType = 'bar';

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading = true;
    forkJoin({
      buyerList:    this.buyers.getBuyers(),
      vendors:      this.api.getAll<any>('vendors'),
      orderList:    this.orders.getOrders(),
      cutting:      this.svc.getDayWiseCuttingProduction(),
      sewing:       this.svc.getDayWiseSewingProduction(),
      finishing:    this.svc.getDayWiseFinishingProduction(),
      packing:      this.svc.getDayWisePackingProduction(),
      packingPlans: this.svc.getPackingPlans(),
    }).subscribe({
      next: ({ buyerList, vendors, orderList, cutting, sewing, finishing, packing, packingPlans }) => {

        // ── KPIs ──────────────────────────────────────────────────────────
        this.kpi.totalBuyers    = buyerList.length;
        this.kpi.totalSuppliers = vendors.length;
        this.kpi.activeOrders   = orderList.filter((o: any) =>
          ['IN_PRODUCTION', 'In Production', 'In Packing', 'In Finishing', 'In Cutting', 'Pending'].includes(o.status)
        ).length;

        const today = this.todayStr;

        this.kpi.todayCut      = cutting.filter((r: any) => r.date === today)
          .reduce((s, r) => s + (Number(r.actual_cut_pieces) || Number(r.actual_quantity) || 0), 0);
        this.kpi.totalCut      = cutting
          .reduce((s, r) => s + (Number(r.actual_cut_pieces) || Number(r.actual_quantity) || 0), 0);

        this.kpi.todaySewn     = sewing.filter((r: any) => r.date === today)
          .reduce((s, r) => s + (Number(r.achieved_quantity) || 0), 0);
        this.kpi.totalSewn     = sewing
          .reduce((s, r) => s + (Number(r.achieved_quantity) || 0), 0);

        this.kpi.todayFinished = finishing.filter((r: any) => r.date === today)
          .reduce((s, r) => s + (Number(r.pass_qty) || 0), 0);
        this.kpi.totalFinished = finishing
          .reduce((s, r) => s + (Number(r.pass_qty) || 0), 0);

        this.kpi.todayPacked   = packing.filter((r: any) => r.date === today)
          .reduce((s, r) => s + (Number(r.today_packed_qty) || 0), 0);
        this.kpi.totalPacked   = packing
          .reduce((s, r) => s + (Number(r.today_packed_qty) || 0), 0);

        // ── Donut Chart (today's section output) ──────────────────────────
        this.donutData = {
          ...this.donutData,
          datasets: [{
            ...this.donutData.datasets[0],
            data: [this.kpi.todayCut, this.kpi.todaySewn, this.kpi.todayFinished, this.kpi.todayPacked]
          }]
        };

        // ── Trend Chart (last 7 days) ─────────────────────────────────────
        const last7 = this.getLast7Days();
        const sewingByDay  = this.groupByDate(sewing,   'date', (r) => Number(r.achieved_quantity) || 0);
        const cuttingByDay = this.groupByDate(cutting, 'date', (r) => Number(r.actual_cut_pieces) || Number(r.actual_quantity) || 0);

        this.trendData = {
          labels: last7.map(d => this.formatShortDate(d)),
          datasets: [
            { ...this.trendData.datasets[0] as any, data: last7.map(d => sewingByDay[d] || 0) },
            { ...this.trendData.datasets[1] as any, data: last7.map(d => cuttingByDay[d] || 0) }
          ]
        };

        // ── Active Orders Table ───────────────────────────────────────────
        this.buildActiveOrdersTable(orderList, buyerList, cutting, sewing, finishing, packing, packingPlans);

        // ── Alerts ────────────────────────────────────────────────────────
        this.buildAlerts(orderList, sewing, cutting);

        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  buildActiveOrdersTable(orderList: any[], buyerList: any[], cutting: any[], sewing: any[], finishing: any[], packing: any[], packingPlans: any[]) {
    const active = orderList.filter((o: any) => !['Completed', 'Shipped', 'COMPLETED'].includes(o.status));

    this.activeOrderRows = active.slice(0, 10).map((order: any) => {
      const buyer = buyerList.find((b: any) => (b.id ?? b.buyerId) === order.buyerId);
      const buyerName = buyer?.companyName ?? buyer?.name ?? 'N/A';
      const targetQty = Number(order.totalQuantity) ||
        (order.items?.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0) ?? 0);

      const totalCut      = cutting.filter((c: any)  => c.order_id === order.id || c.order_id === order.orderId)
        .reduce((s, r) => s + (Number(r.actual_cut_pieces) || Number(r.actual_quantity) || 0), 0);
      const totalSewn     = sewing.filter((s: any)   => s.order_no === order.poNumber)
        .reduce((s, r) => s + (Number(r.achieved_quantity) || 0), 0);
      const totalFinished = finishing.filter((f: any) => f.order_no === order.poNumber)
        .reduce((s, r) => s + (Number(r.pass_qty) || 0), 0);
      const totalPacked   = packing.filter((p: any)  => p.order_no === order.poNumber)
        .reduce((s, r) => s + (Number(r.today_packed_qty) || 0), 0);

      // WIP per stage
      const sewingWIP    = Math.max(0, totalCut - totalSewn);
      const finishingWIP = Math.max(0, totalSewn - totalFinished);
      const packingWIP   = Math.max(0, totalFinished - totalPacked);

      // Current dominant stage
      const wips = [
        { label: 'Cutting',   wip: Math.max(0, targetQty - totalCut) },
        { label: 'Sewing',    wip: sewingWIP },
        { label: 'Finishing', wip: finishingWIP },
        { label: 'Packing',   wip: packingWIP },
      ];
      const maxWip = wips.reduce((a, b) => b.wip > a.wip ? b : a, wips[0]);
      const currentStage = maxWip.wip > 0 ? maxWip.label : 'Complete';

      const progress = targetQty > 0 ? Math.min(100, Math.round((totalPacked / targetQty) * 100)) : 0;

      return {
        styleNo:   order.styleCode ?? order.poNumber ?? order.id,
        buyerName,
        targetQty,
        currentStage,
        totalPacked,
        shipDate: order.shipDate ?? order.endDate ?? '',
        progress,
        status: order.status
      };
    }).sort((a: any, b: any) => new Date(a.shipDate).getTime() - new Date(b.shipDate).getTime());
  }

  buildAlerts(orderList: any[], sewing: any[], cutting: any[]) {
    this.alerts = [];
    const today = new Date();

    // Alert 1: Shipment deadline within 7 days
    orderList.forEach((order: any) => {
      if (['Completed', 'Shipped'].includes(order.status)) return;
      if (!order.shipDate) return;
      const ship = new Date(order.shipDate);
      const diffDays = Math.ceil((ship.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 7) {
        this.alerts.push({
          type: 'danger',
          icon: 'bi-alarm',
          title: 'Shipment Deadline Near!',
          message: `Order ${order.poNumber ?? order.id} ships in ${diffDays} day${diffDays !== 1 ? 's' : ''}. Accelerate packing immediately!`
        });
      }
    });

    // Alert 2: High rejection rate in sewing today
    const today2 = this.todayStr;
    const todaySewing = sewing.filter((r: any) => r.date === today2);
    const todaySewingOutput = todaySewing.reduce((s, r) => s + (Number(r.achieved_quantity) || 0), 0);
    const todaySewingRejects = todaySewing.reduce((s, r) => s + (Number(r.rejection_qty) || 0), 0);
    if (todaySewingOutput > 0) {
      const rejectRate = (todaySewingRejects / (todaySewingOutput + todaySewingRejects)) * 100;
      if (rejectRate > 5) {
        this.alerts.push({
          type: 'warning',
          icon: 'bi-exclamation-triangle',
          title: 'High Rejection Rate!',
          message: `Today's sewing rejection rate is ${rejectRate.toFixed(1)}% — exceeds the 5% threshold! Check line quality.`
        });
      }
    }

    // Alert 3: High cutting rejection today
    const todayCutting = cutting.filter((r: any) => r.date === today2);
    const todayCuttingOut  = todayCutting.reduce((s, r) => s + (Number(r.actual_cut_pieces) || 0), 0);
    const todayCuttingRej  = todayCutting.reduce((s, r) => s + (Number(r.reject_pieces) || 0), 0);
    if (todayCuttingOut > 0) {
      const rejRate = (todayCuttingRej / (todayCuttingOut + todayCuttingRej)) * 100;
      if (rejRate > 5) {
        this.alerts.push({
          type: 'warning',
          icon: 'bi-scissors',
          title: 'High Cutting Rejection!',
          message: `Today's cutting rejection rate is ${rejRate.toFixed(1)}% — exceeds 5%. Review marker and blade settings.`
        });
      }
    }

    if (this.alerts.length === 0) {
      this.alerts.push({
        type: 'warning',
        icon: 'bi-check-circle',
        title: 'All Clear!',
        message: 'No active alerts. Factory is running smoothly today.'
      });
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getLast7Days(): string[] {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().substring(0, 10));
    }
    return days;
  }

  groupByDate(records: any[], dateField: string, valueFn: (r: any) => number): Record<string, number> {
    const result: Record<string, number> = {};
    records.forEach(r => {
      const d = r[dateField];
      if (d) result[d] = (result[d] || 0) + valueFn(r);
    });
    return result;
  }

  formatShortDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  isNearDeadline(shipDate: string): boolean {
    if (!shipDate) return false;
    const diff = (new Date(shipDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }

  getStageBadgeClass(stage: string): string {
    const map: Record<string, string> = {
      'Cutting':   'bg-dark-subtle text-dark',
      'Sewing':    'bg-primary-subtle text-primary',
      'Finishing': 'bg-warning-subtle text-warning',
      'Packing':   'bg-success-subtle text-success',
      'Complete':  'bg-success text-white'
    };
    return map[stage] ?? 'bg-secondary-subtle text-secondary';
  }
}
