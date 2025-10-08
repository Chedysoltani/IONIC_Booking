import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExpertsPageRoutingModule } from './experts-routing.module';

import { ExpertsPage } from './experts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExpertsPageRoutingModule,
    ExpertsPage
  ],
  declarations: []
})
export class ExpertsPageModule {}
