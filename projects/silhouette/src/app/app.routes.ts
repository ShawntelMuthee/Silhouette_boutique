import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AdminLogin } from './admin-login/admin-login';
import { AdminLayout } from './admin-layout/admin-layout';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'admin/login', component: AdminLogin },
  { 
    path: 'admin', 
    component: AdminLayout,
    children: [
      { path: 'dashboard', component: AdminDashboard },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
