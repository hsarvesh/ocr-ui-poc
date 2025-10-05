
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { ImageProcessingComponent } from './image-processing/image-processing';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'image-processing', component: ImageProcessingComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
