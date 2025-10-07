import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../auth.service';

/**
 * The login component.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class LoginComponent {
  // The authentication service.
  private readonly authService = inject(AuthService);

  /**
   * Logs the user in with Google.
   */
  login() {
    this.authService.loginWithGoogle();
  }
}
