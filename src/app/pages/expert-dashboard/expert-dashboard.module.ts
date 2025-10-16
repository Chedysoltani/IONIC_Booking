import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpertDashboardPageRoutingModule } from './expert-dashboard-routing.module';

import { ExpertDashboardPage } from './expert-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpertDashboardPageRoutingModule,
    ExpertDashboardPage
  ],
  declarations: []
})
export class ExpertDashboardPageModule {}
