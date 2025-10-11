import { Component, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth.service';
import { UserMenuComponent } from './user-menu/user-menu';
import { CommonModule } from '@angular/common';

/**
 * The root component of the application.
 * It provides the main layout, including a persistent header and the routing outlet.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet, UserMenuComponent, CommonModule],
})
export class AppComponent {
  // The authentication service for user management.
  readonly authService = inject(AuthService);
  // The Angular router for navigation.
  private readonly router = inject(Router);

  /**
   * The constructor for the AppComponent.
   * It sets up an effect to react to changes in the authentication state.
   */
  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.router.navigate(['/image-processing']);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
