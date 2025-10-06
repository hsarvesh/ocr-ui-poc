
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OcrService } from '../ocr.service';
import { AuthService } from '../auth.service';

interface ProcessedFile extends File {
  previewUrl?: string;
  result?: string;
  error?: string;
}

interface FileStatus {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
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
  readonly currentImageIndex = signal(0);
  readonly processedCount = signal(0);
  readonly fileStatuses = signal<FileStatus[]>([]);

  readonly isNextEnabled = computed(() => {
    if (this.currentStep() === 2) {
      return this.files().length > 0;
    }
    return true;
  });

  readonly currentImage = computed(() => {
    if (this.files().length > 0) {
      return this.files()[this.currentImageIndex()];
    }
    return null;
  });

  readonly progressPercentage = computed(() => {
    if (this.files().length === 0) return 0;
    return Math.round((this.processedCount() / this.files().length) * 100);
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
    this.currentImageIndex.set(0);
    this.processedCount.set(0);
    this.fileStatuses.set([]);
  }

  previousImage() {
    if (this.currentImageIndex() > 0) {
      this.currentImageIndex.update(value => value - 1);
    }
  }

  nextImage() {
    if (this.currentImageIndex() < this.files().length - 1) {
      this.currentImageIndex.update(value => value + 1);
    }
  }

  copyText() {
    const text = this.currentImage()?.result;
    if (text) {
      navigator.clipboard.writeText(text);
    }
  }

  downloadAllText() {
    if (this.files().length === 0) {
      return;
    }

    const content = this.files().map(img => {
      return `${img.name}\n${img.result || 'No text extracted'}\n\n`;
    }).join('---------------------------------------------------\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'extracted_text.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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

  private async processImages() {
    this.isProcessing.set(true);
    this.error.set(null);
    this.currentStep.set(3);
    this.processedCount.set(0);
    this.fileStatuses.set(this.files().map(file => ({ name: file.name, status: 'pending', message: 'In queue' })));

    const filesToProcess = [...this.files()];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      this.updateFileStatus(file.name, 'pending', 'Processing...');

      try {
        const result = await this.ocrService.getTextFromImage(file, this.layout()).toPromise();
        const processedFile: ProcessedFile = file;

        if (typeof result === 'object' && result && 'extracted_text' in result) {
            processedFile.result = (result as { extracted_text: string }).extracted_text;
        } else {
            processedFile.error = 'Unexpected result format';
        }

        this.updateFileStatus(file.name, 'success', 'Completed');
        const updatedFiles = this.files().map(f => f.name === file.name ? processedFile : f);
        this.files.set(updatedFiles);

      } catch (err: any) {
        const errorMessage = `Processing failed: ${err.message}`;
        const processedFile: ProcessedFile = file;
        processedFile.error = err.message;
        const updatedFiles = this.files().map(f => f.name === file.name ? processedFile : f);
        this.files.set(updatedFiles);
        this.updateFileStatus(file.name, 'error', errorMessage);
      }
      this.processedCount.update(value => value + 1);
    }

    this.isProcessing.set(false);
    this.currentStep.set(4);
  }

  private updateFileStatus(fileName: string, status: 'pending' | 'success' | 'error', message: string) {
    this.fileStatuses.update(statuses =>
      statuses.map(s => s.name === fileName ? { ...s, status, message } : s)
    );
  }
}
