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
        path: 'buyers',
        loadComponent: () => import('./features/buyers/buyer-list/buyer-list.component').then(m => m.BuyerListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'buyers/:id',
        loadComponent: () => import('./features/buyers/buyer-details/buyer-details.component').then(m => m.BuyerDetailsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'styles',
        loadComponent: () => import('./features/styles/style-list/style-list.component').then(m => m.StyleListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'styles/new',
        loadComponent: () => import('./features/styles/style-form/style-form.component').then(m => m.StyleFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'styles/:id',
        loadComponent: () => import('./features/styles/style-details/style-details.component').then(m => m.StyleDetailsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'styles/edit/:id',
        loadComponent: () => import('./features/styles/style-form/style-form.component').then(m => m.StyleFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'orders/new',
        loadComponent: () => import('./features/orders/order-wizard/order-wizard.component').then(m => m.OrderWizardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'orders/edit/:id',
        loadComponent: () => import('./features/orders/order-wizard/order-wizard.component').then(m => m.OrderWizardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'merchandising',
        loadComponent: () => import('./features/merchandising/bom-builder/bom-builder.component').then(m => m.BOMBuilderComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'MERCHANDISER'] }
      },
      {
        path: 'production',
        loadComponent: () => import('./features/production/production-dashboard/production-dashboard.component').then(m => m.ProductionDashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MGR', 'SUPERVISOR'] }
      },
      {
        path: 'production/assign',
        loadComponent: () => import('./features/production/production-form/production-form.component').then(m => m.ProductionFormComponent),
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
        path: 'inventory',
        loadComponent: () => import('./features/inventory/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'STOREKEEPER'] }
      },
      {
        path: 'inventory/new-transaction',
        loadComponent: () => import('./features/inventory/inventory-form/inventory-form.component').then(m => m.InventoryFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'STOREKEEPER'] }
      },
      {
        path: 'inventory/transactions',
        loadComponent: () => import('./features/inventory/transaction-table/transaction-table.component').then(m => m.TransactionTableComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'STOREKEEPER'] }
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
