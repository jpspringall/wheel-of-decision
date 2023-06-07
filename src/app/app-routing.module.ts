import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WheelComponent } from './wheel/wheel.component';

const routes: Routes = [
  { path: '', component: WheelComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
