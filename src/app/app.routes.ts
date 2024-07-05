import { Routes } from '@angular/router';
import { WheelComponent } from './wheel/wheel.component';

export const routes: Routes = [
    { path: '', component: WheelComponent },
    { path: '**', redirectTo: '' },
];
