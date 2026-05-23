import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
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
        data: { roles: ['ADMIN', 'MERCHANDISER', 'PRODUCTION_MGR', 'SUPERVISOR', 'QA_OFFICER', 'STOREKEEPER', 'VIEWER'] }
      },
      {
        path: 'buyer-management',
        loadComponent: () => import('./features/buyer-management/buyer-management.component').then(m => m.BuyerManagementComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'uom-management',
        loadComponent: () => import('./features/uom-management/uom-management.component').then(m => m.UomManagementComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'bom-style',
        loadComponent: () => import('./features/bom-style/bom-style.component').then(m => m.BomStyleComponent),
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
        loadComponent: () => import('./features/order-management/order-management.component').then(m => m.OrderManagementComponent),
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
        path: 'production-planning/add-daywise-production',
        loadComponent: () => import('./features/production-planning/add-daywise-production/add-daywise-production.component').then(m => m.AddDaywiseProductionComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR'] }
      },
      {
        path: 'production-planning/view-daywise-production',
        loadComponent: () => import('./features/production-planning/view-daywise-production/view-daywise-production.component').then(m => m.ViewDaywiseProductionComponent),
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
        path: 'qa',
        loadComponent: () => import('./features/qa/qa-dashboard/qa-dashboard.component').then(m => m.QADashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'QA_OFFICER'] }
      },
      {
        path: 'qa/inspect',
        loadComponent: () => import('./features/qa/qa-inspection-form/qa-inspection-form.component').then(m => m.QAInspectionFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'QA_OFFICER'] }
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
        data: { roles: ['ADMIN', 'MERCHANDISER', 'PRODUCTION_MGR', 'SUPERVISOR', 'QA_OFFICER', 'STOREKEEPER', 'VIEWER'] }
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
