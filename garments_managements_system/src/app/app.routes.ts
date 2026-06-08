import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./features/auth/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER', 'PRODUCTION_MGR', 'STOREKEEPER', 'PURCHASE_MGR'] }
      },
      {
        path: 'buyer-management',
        loadComponent: () => import('./features/buyer-management/buyer-management.component').then(m => m.BuyerManagementComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'uom-management',
        redirectTo: 'uom-management/list',
        pathMatch: 'full'
      },
      {
        path: 'uom-management/add',
        loadComponent: () => import('./features/uom-management/add-uom/add-uom.component').then(m => m.AddUomComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'uom-management/list',
        loadComponent: () => import('./features/uom-management/uom-list/uom-list.component').then(m => m.UomListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'bom-style',
        redirectTo: 'bom-style/list',
        pathMatch: 'full'
      },
      {
        path: 'bom-style/add',
        loadComponent: () => import('./features/bom-style/add-bom-style/add-bom-style.component').then(m => m.AddBomStyleComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'bom-style/list',
        loadComponent: () => import('./features/bom-style/bom-style-list/bom-style-list.component').then(m => m.BomStyleListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'bom-style/detail/:styleCode',
        loadComponent: () => import('./features/bom-style/bom-style-detail/bom-style-detail.component').then(m => m.BomStyleDetailComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'bom-view',
        loadComponent: () => import('./features/bom-view/bom-view.component').then(m => m.BomViewComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'order-management',
        redirectTo: 'order-management/list',
        pathMatch: 'full'
      },
      {
        path: 'order-management/create',
        loadComponent: () => import('./features/order-management/create-order/create-order.component').then(m => m.CreateOrderComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'order-management/list',
        loadComponent: () => import('./features/order-management/order-list/order-list.component').then(m => m.OrderListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'order-management/detail/:id',
        loadComponent: () => import('./features/order-management/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'raw-materials',
        loadComponent: () => import('./features/raw-materials/raw-materials.component').then(m => m.RawMaterialsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'raw-materials/view-checks',
        loadComponent: () => import('./features/raw-materials/view-raw-material-check/view-raw-material-check.component').then(m => m.ViewRawMaterialCheckComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'production-planning/add-production-order',
        loadComponent: () => import('./features/production-planning/add-production-order/add-production-order.component').then(m => m.AddProductionOrderComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-production-order',
        loadComponent: () => import('./features/production-planning/view-production-order/view-production-order.component').then(m => m.ViewProductionOrderComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/production-summary-report',
        loadComponent: () => import('./features/production-planning/production-summary-report/production-summary-report.component').then(m => m.ProductionSummaryReportComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/line-list',
        loadComponent: () => import('./features/production-planning/line-list/line-list.component').then(m => m.LineListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/machine-list',
        loadComponent: () => import('./features/production-planning/machine-list/machine-list.component').then(m => m.MachineListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-cutting-plan',
        loadComponent: () => import('./features/production-planning/add-cutting-plan/add-cutting-plan.component').then(m => m.AddCuttingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-cutting-plan',
        loadComponent: () => import('./features/production-planning/view-cutting-plan/view-cutting-plan.component').then(m => m.ViewCuttingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-day-wise-cutting-production',
        loadComponent: () => import('./features/production-planning/add-day-wise-cutting-production/add-day-wise-cutting-production.component').then(m => m.AddDayWiseCuttingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-day-wise-cutting-production',
        loadComponent: () => import('./features/production-planning/view-day-wise-cutting-production/view-day-wise-cutting-production.component').then(m => m.ViewDayWiseCuttingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-sewing-plan',
        loadComponent: () => import('./features/production-planning/add-sewing-plan/add-sewing-plan.component').then(m => m.AddSewingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-sewing-plan',
        loadComponent: () => import('./features/production-planning/view-sewing-plan/view-sewing-plan.component').then(m => m.ViewSewingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-day-wise-sewing-production',
        loadComponent: () => import('./features/production-planning/add-day-wise-sewing-production/add-day-wise-sewing-production.component').then(m => m.AddDayWiseSewingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-day-wise-sewing-production',
        loadComponent: () => import('./features/production-planning/view-day-wise-sewing-production/view-day-wise-sewing-production.component').then(m => m.ViewDayWiseSewingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-finishing-plan',
        loadComponent: () => import('./features/production-planning/add-finishing-plan/add-finishing-plan.component').then(m => m.AddFinishingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-finishing-plan',
        loadComponent: () => import('./features/production-planning/view-finishing-plan/view-finishing-plan.component').then(m => m.ViewFinishingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-day-wise-finishing-production',
        loadComponent: () => import('./features/production-planning/add-day-wise-finishing-production/add-day-wise-finishing-production.component').then(m => m.AddDayWiseFinishingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-day-wise-finishing-production',
        loadComponent: () => import('./features/production-planning/view-day-wise-finishing-production/view-day-wise-finishing-production.component').then(m => m.ViewDayWiseFinishingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-packing-plan',
        loadComponent: () => import('./features/production-planning/add-packing-plan/add-packing-plan.component').then(m => m.AddPackingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-packing-plan',
        loadComponent: () => import('./features/production-planning/view-packing-plan/view-packing-plan.component').then(m => m.ViewPackingPlanComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/add-day-wise-packing-production',
        loadComponent: () => import('./features/production-planning/add-day-wise-packing-production/add-day-wise-packing-production.component').then(m => m.AddDayWisePackingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-day-wise-packing-production',
        loadComponent: () => import('./features/production-planning/view-day-wise-packing-production/view-day-wise-packing-production.component').then(m => m.ViewDayWisePackingProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'procurement/add-vendor',
        loadComponent: () => import('./features/procurement/add-vendor/add-vendor.component').then(m => m.AddVendorComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/view-vendor',
        loadComponent: () => import('./features/procurement/view-vendor/view-vendor.component').then(m => m.ViewVendorComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/add-item',
        loadComponent: () => import('./features/procurement/add-item/add-item.component').then(m => m.AddItemComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/view-item',
        loadComponent: () => import('./features/procurement/view-item/view-item.component').then(m => m.ViewItemComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/stock-in',
        loadComponent: () => import('./features/procurement/stock-in/stock-in.component').then(m => m.StockInComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/stock-out',
        loadComponent: () => import('./features/procurement/stock-out/stock-out.component').then(m => m.StockOutComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/inventory-list',
        loadComponent: () => import('./features/procurement/inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/create-requisition',
        loadComponent: () => import('./features/procurement/create-requisition/create-requisition.component').then(m => m.CreateRequisitionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/view-requisition',
        loadComponent: () => import('./features/procurement/view-requisition/view-requisition.component').then(m => m.ViewRequisitionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/create-po',
        loadComponent: () => import('./features/procurement/create-po/create-po.component').then(m => m.CreatePoComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'procurement/view-po',
        loadComponent: () => import('./features/procurement/view-po/view-po.component').then(m => m.ViewPoComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PURCHASE_MGR'] }
      },
      {
        path: 'shipment',
        loadComponent: () => import('./features/shipment/shipment-tracking/shipment-tracking.component').then(m => m.ShipmentTrackingComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'shipment/new',
        loadComponent: () => import('./features/shipment/shipment-entry/shipment-entry.component').then(m => m.ShipmentEntryComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'shipment/packing-list/:id',
        loadComponent: () => import('./features/shipment/packing-list/packing-list.component').then(m => m.PackingListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER', 'PRODUCTION_MGR', 'STOREKEEPER'] }
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
