import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../auth.service';
import { CreditsService } from '../credits.service';
import { User } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';

/**
 * The user menu component.
 * Displays user information, credit balance, and a dropdown menu with actions.
 */
@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.html',
  styleUrls: ['./user-menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class UserMenuComponent {
  // The authentication service for user management.
  readonly authService = inject(AuthService);
  // The credit service for managing user credits.
  readonly creditsService = inject(CreditsService);

  // Tracks the visibility of the user dropdown menu.
  readonly isDropdownOpen = signal(false);

  /** Toggles the visibility of the user dropdown menu. */
  toggleDropdown() {
    this.isDropdownOpen.update((open: boolean) => !open);
  }

  /** Logs the user out. */
  logout() {
    this.authService.logout();
    this.isDropdownOpen.set(false);
  }
}
