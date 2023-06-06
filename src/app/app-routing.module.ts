import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { WheelComponent } from './wheel/wheel.component';

const routes: Routes = [
  { path: '', redirectTo: '/wheel', pathMatch: 'full' },
  { path: 'wheel', component: WheelComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
