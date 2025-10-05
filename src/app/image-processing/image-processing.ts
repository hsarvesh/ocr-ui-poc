
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { User } from 'firebase/auth';
import { ImageUploadComponent } from '../image-upload/image-upload';
import { OcrService } from '../ocr.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProcessingComponent } from '../processing/processing';

@Component({
  selector: 'app-image-processing',
  imports: [CommonModule, ImageUploadComponent, ProcessingComponent],
  templateUrl: './image-processing.html',
  styleUrls: ['./image-processing.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageProcessingComponent {
  protected readonly authService = inject(AuthService);
  protected readonly ocrService = inject(OcrService);

  protected user: User | null = null;
  protected selectedLayout = signal('single');
  protected currentStep = signal(1);
  protected isDropdownOpen = signal(false);
  protected uploadedFiles = signal<File[]>([]);
  protected extractedText = signal<string[]>([]);
  protected isProcessing = signal(false);
  protected processingError = signal<string | null>(null);

  constructor() {
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  selectLayout(layout: string) {
    this.selectedLayout.set(layout);
  }

  nextStep() {
    this.currentStep.update(step => step + 1);
    if (this.currentStep() === 3) {
      this.processImages();
    }
  }

  previousStep() {
    this.currentStep.update(step => step - 1);
  }

  onFilesUploaded(files: File[]) {
    this.uploadedFiles.set(files);
  }

  processImages() {
    this.isProcessing.set(true);
    this.processingError.set(null);
    this.extractedText.set([]);
    const imageType = this.selectedLayout() === 'single' ? '1column' : '2column';
    const files = this.uploadedFiles();

    const requests = files.map(file =>
      this.ocrService.getTextFromImage(file, imageType).pipe(
        tap(response => {
          this.extractedText.update(texts => [...texts, response.extracted_text]);
        }),
        catchError(error => {
          this.processingError.set('An error occurred while processing the images.');
          return of(null);
        })
      )
    );
    
  }

  toggleDropdown() {
    this.isDropdownOpen.update(value => !value);
  }

  logout() {
    this.authService.logout();
  }

  startOver(): void {
    this.currentStep.set(1);
    this.uploadedFiles.set([]);
    this.extractedText.set([]);
    this.isProcessing.set(false);
    this.processingError.set(null);
  }
}
