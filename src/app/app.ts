
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { UserMenuComponent } from './user-menu/user-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule, UserMenuComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly authService = inject(AuthService);

  login() {
    this.authService.loginWithGoogle();
  }
}
