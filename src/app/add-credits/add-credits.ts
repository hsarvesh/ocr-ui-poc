import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-add-credits',
  template: `
    <div class="container">
      <h2>Add Credits</h2>
      <p>This feature is not yet implemented.</p>
    </div>
  `,
  styles: [`
    .container {
      padding: 2rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class AddCreditsComponent {}
