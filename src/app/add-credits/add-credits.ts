import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditsService } from '../credits.service';

@Component({
  selector: 'app-add-credits',
  template: `
    <div class="container">
      <h2>Add Credits</h2>
      @if (message()) {
        <p [class]="messageType()">{{ message() }}</p>
      }
      <p>Current Balance: {{ creditsService.credits() }}</p>
      <button (click)="addCredits()">Purchase 50 Credits</button>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
      text-align: center;
    }
    .success {
      color: green;
    }
    .error {
      color: red;
    }
    button {
      padding: 10px 20px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class AddCreditsComponent {
  protected readonly creditsService = inject(CreditsService);
  readonly message = signal<string | null>(null);
  readonly messageType = signal<'success' | 'error' | null>(null);

  constructor() {
    // Expose the credits signal from the service to the template
    // This will be automatically updated via the effect in CreditsService
  }

  async addCredits() {
    this.message.set(null);
    this.messageType.set(null);
    try {
      const newBalance = await this.creditsService.addCredits(50, 'Credit Purchase');
      this.message.set(`Successfully purchased 50 credits. New balance: ${newBalance}`);
      this.messageType.set('success');
    } catch (error: any) {
      console.error('Error purchasing credits:', error);
      this.message.set(`Failed to purchase credits: ${error.message}`);
      this.messageType.set('error');
    }
  }
}
