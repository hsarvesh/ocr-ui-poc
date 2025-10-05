
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcrService } from '../ocr.service';
import { AuthService } from '../auth.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface ProcessedFile extends File {
  previewUrl?: string;
  result?: string;
  error?: string;
}

@Component({
  selector: 'app-image-processing',
  imports: [CommonModule],
  templateUrl: './image-processing.html',
  styleUrls: ['./image-processing.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProcessingComponent {
  private readonly ocrService = inject(OcrService);
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user$;
  readonly currentStep = signal(1);
  readonly layout = signal<'1column' | '2column'>('1column');
  readonly files = signal<ProcessedFile[]>([]);
  readonly isProcessing = signal(false);
  readonly error = signal<string | null>(null);
  readonly isDropdownOpen = signal(false);

  readonly isNextEnabled = computed(() => {
    if (this.currentStep() === 2) {
      return this.files().length > 0;
    }
    return true;
  });

  selectLayout(layout: '1column' | '2column') {
    this.layout.set(layout);
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  logout() {
    this.authService.logout();
  }

  back() {
    if (this.currentStep() > 1) {
      this.currentStep.update(value => value - 1);
    }
  }

  next() {
    if (this.currentStep() === 2) {
      this.processImages();
    } else {
      this.currentStep.update(value => value + 1);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const fileList = Array.from(input.files) as ProcessedFile[];
      Promise.all(fileList.map(file => this.createPreview(file)))
        .then(processedFiles => {
          this.files.set(processedFiles);
        });
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const fileList = Array.from(event.dataTransfer.files) as ProcessedFile[];
      Promise.all(fileList.map(file => this.createPreview(file)))
        .then(processedFiles => {
          this.files.set(processedFiles);
        });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

  startOver() {
    this.currentStep.set(1);
    this.files.set([]);
    this.error.set(null);
  }

  private createPreview(file: ProcessedFile): Promise<ProcessedFile> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        file.previewUrl = e.target.result;
        resolve(file);
      };
      reader.readAsDataURL(file);
    });
  }

  private processImages() {
    this.isProcessing.set(true);
    this.error.set(null);
    this.currentStep.set(3); // Move to processing step

    const processingRequests = this.files().map(file =>
      this.ocrService.getTextFromImage(file, this.layout()).pipe(
        catchError(err => {
          const errorMessage = `Error processing ${file.name}: ${err.message}`;
          console.error(errorMessage);
          // Update the file object with the error
          const processedFile: ProcessedFile = file;
          processedFile.error = errorMessage;
          return of(processedFile); // Return a processed file with an error
        })
      )
    );

    forkJoin(processingRequests).subscribe({
      next: results => {
        const processedFiles = this.files().map((file, index) => {
          const result = results[index];
          if (typeof result === 'object' && result && 'extracted_text' in result) {
            (file as ProcessedFile).result = (result as { extracted_text: string }).extracted_text;
          } else if(result instanceof File) {
            // it's a file with an error
          } else {
            (file as ProcessedFile).error = 'Unexpected result format';
          }
          return file;
        });

        this.files.set(processedFiles);
        this.isProcessing.set(false);
        this.currentStep.set(4); // Move to results step
      },
      error: err => {
        console.error('An unexpected error occurred:', err);
        this.error.set('An unexpected error occurred during image processing.');
        this.isProcessing.set(false);
      },
    });
  }
}
