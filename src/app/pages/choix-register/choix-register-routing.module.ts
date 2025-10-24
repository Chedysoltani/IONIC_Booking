import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChoixRegisterPage } from './choix-register.page';

const routes: Routes = [
  {
    path: '',
    component: ChoixRegisterPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChoixRegisterPageRoutingModule {}
