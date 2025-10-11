import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AddCreditsComponent } from './add-credits/add-credits';
import { ViewTransactionsComponent } from './view-transactions/view-transactions';

/**
 * The application's routes.
 */
export const routes: Routes = [
  {
    // Redirect the root path to the login page.
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    // Lazy-load the login component.
    path: 'login',
    loadComponent: () =>
      import('./login/login').then((m) => m.LoginComponent),
  },
  {
    // Lazy-load the image processing component.
    path: 'image-processing',
    loadComponent: () =>
      import('./image-processing/image-processing').then(
        (m) => m.ImageProcessingComponent
      ),
  },
  {
    path: 'add-credits',
    component: AddCreditsComponent
  },
  {
    path: 'view-transactions',
    component: ViewTransactionsComponent
  },
];
