
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'image-processing',
    loadChildren: () => import('./image-processing/image-processing.routes').then(m => m.routes)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
