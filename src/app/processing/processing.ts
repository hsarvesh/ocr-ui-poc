
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-processing',
  imports: [CommonModule],
  templateUrl: './processing.html',
  styleUrls: ['./processing.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessingComponent {
  isProcessing = input.required<boolean>();
  processingError = input.required<string | null>();
  extractedText = input.required<string[]>();

  startOver = output<void>();

  onStartOver() {
    this.startOver.emit();
  }
}
