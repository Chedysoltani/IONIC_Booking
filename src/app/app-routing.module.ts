import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing-page',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
  },
  {
    path: 'register-expert',
    loadComponent: () => import('./pages/auth/register-expert/register-expert.page').then(m => m.RegisterExpertPage)
  },
  
  {
    path: 'user-dashboard',
    loadComponent: () => import('./pages/user-dashboard/user-dashboard.page').then(m => m.UserDashboardPage)
  },
  {
    path: 'admin-dashboard',
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.page').then(m => m.AdminDashboardPage)
  },
  {
    path: 'experts',
    loadComponent: () => import('./pages/experts/experts.page').then(m => m.ExpertsPage),
    canActivate: [authGuard]
  },
  {
    path: 'booking',
    loadComponent: () => import('./pages/booking/booking.page').then(m => m.BookingPage),
    canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'landing-page',
    loadChildren: () => import('./pages/landing-page/landing-page.module').then( m => m.LandingPagePageModule)
  },
  {
    path: 'expert-dashboard',
    loadChildren: () => import('./pages/expert-dashboard/expert-dashboard.module').then( m => m.ExpertDashboardPageModule)
  },
  {
    path: 'choix-register',
    loadChildren: () => import('./pages/choix-register/choix-register.module').then( m => m.ChoixRegisterPageModule)
  },
  {
    path: 'login-admin',
    loadChildren: () => import('./pages/auth/login-admin/login-admin.module').then( m => m.LoginAdminPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
