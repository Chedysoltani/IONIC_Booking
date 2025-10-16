import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExpertDashboardPage } from './expert-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: ExpertDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpertDashboardPageRoutingModule {}
