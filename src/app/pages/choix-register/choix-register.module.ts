import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChoixRegisterPageRoutingModule } from './choix-register-routing.module';

import { ChoixRegisterPage } from './choix-register.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChoixRegisterPageRoutingModule,
    ChoixRegisterPage
  ],
  declarations: []
})
export class ChoixRegisterPageModule {}
