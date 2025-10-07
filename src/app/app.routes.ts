import { Routes } from '@angular/router';

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
];
