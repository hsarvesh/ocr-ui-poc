
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { CreditsService } from '../credits.service';

@Component({
  selector: 'app-user-menu',
  imports: [CommonModule],
  templateUrl: './user-menu.html',
  styleUrls: ['./user-menu.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  protected readonly creditsService = inject(CreditsService);

  readonly user$ = this.authService.user$;
  readonly isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update(isOpen => !isOpen);
  }

  logout() {
    this.authService.logout();
  }
}
