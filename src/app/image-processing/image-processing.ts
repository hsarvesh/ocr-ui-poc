import { ChangeDetectionStrategy, Component, computed, inject, signal, WritableSignal } from '@angular/core';
import { OcrService } from '../ocr.service';
import { AuthService } from '../auth.service';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AsyncPipe } from '@angular/common';
import { User } from '@angular/fire/auth';
import { take } from 'rxjs/operators';

// Defines the structure for a file being processed, including its preview URL and OCR result.
interface ProcessedFile extends File {
  previewUrl?: string;
  result?: string;
}

// Defines the structure for tracking the status of a file during processing.
interface FileStatus {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

/**
 * The image processing component.
 * This component handles the multi-step process of:
 * 1. Selecting a layout.
 * 2. Uploading images.
 * 3. Processing images with OCR.
 * 4. Displaying the results.
 */
@Component({
  selector: 'app-image-processing',
  templateUrl: './image-processing.html',
  styleUrls: ['./image-processing.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [AsyncPipe] // Import AsyncPipe to use the async pipe in the template.
})
export class ImageProcessingComponent {
  // The OCR service for text extraction.
  private readonly ocrService = inject(OcrService);
  // The authentication service for user management.
  readonly authService = inject(AuthService);
  // The Firebase Firestore service for database operations.
  private readonly firestore = inject(Firestore);

  // --- Component State Signals ---

  // The current user object as an observable.
  readonly user$ = this.authService.user$;
  // Tracks the visibility of the user dropdown menu.
  readonly isDropdownOpen = signal(false);
  // The current step in the multi-step process (1-4).
  readonly currentStep = signal(1);
  // The selected layout for the document ('1column' or '2column').
  readonly layout = signal<'1column' | '2column' | null>(null);
  // A list of files selected by the user for processing.
  readonly files: WritableSignal<ProcessedFile[]> = signal([]);
  // Tracks the status of each uploaded file.
  readonly fileStatuses = signal<FileStatus[]>([]);
  // The index of the currently displayed image in the results carousel.
  readonly currentImageIndex = signal(0);
  // A signal that holds the user's credit count.
  readonly creditCount = signal(0);

  // --- Computed Signals for Derived State ---

  // Determines if the 'Next' button should be enabled based on the current step's requirements.
  readonly isNextEnabled = computed(() => {
    switch (this.currentStep()) {
      case 1: return this.layout() !== null;
      case 2: return this.files().length > 0;
      default: return false;
    }
  });

  // The currently selected image to be displayed in the carousel.
  readonly currentImage = computed(() => this.files()[this.currentImageIndex()]);

  // The number of files that have been successfully processed.
  readonly processedCount = computed(() => this.fileStatuses().filter(s => s.status === 'success').length);

  // The progress of the image processing task as a percentage.
  readonly progressPercentage = computed(() => {
    if (this.files().length === 0) return 0;
    return (this.processedCount() / this.files().length) * 100;
  });

  /**
   * The constructor for the ImageProcessingComponent.
   * It subscribes to user changes to fetch and update the credit count.
   */
  constructor() {
    this.user$.subscribe(user => {
      if (user) {
        const creditRef = doc(this.firestore, `credits/${user.uid}`);
        docData(creditRef).subscribe((creditData: any) => {
          this.creditCount.set(creditData?.count ?? 0);
        });
      }
    });
  }

  // --- Stepper Navigation ---

  /** Advances to the next step in the process. */
  next() {
    if (this.isNextEnabled()) {
      if (this.currentStep() === 2) {
        this.processFiles();
      }
      this.currentStep.update(step => step + 1);
    }
  }

  /** Returns to the previous step in the process. */
  back() {
    this.currentStep.update(step => step - 1);
  }

  /** Resets the component state to the beginning. */
  startOver() {
    this.currentStep.set(1);
    this.layout.set(null);
    this.files.set([]);
    this.fileStatuses.set([]);
    this.currentImageIndex.set(0);
  }

  // --- User and Auth Methods ---

  /** Toggles the visibility of the user dropdown menu. */
  toggleDropdown() {
    this.isDropdownOpen.update(open => !open);
  }

  /** Logs the user out. */
  logout() {
    this.authService.logout();
    this.isDropdownOpen.set(false);
  }

  // --- Step 1: Layout Selection ---

  /**
   * Sets the document layout.
   * @param layout The layout to select.
   */
  selectLayout(layout: '1column' | '2column') {
    this.layout.set(layout);
  }

  // --- Step 2: File Upload ---

  /**
   * Handles files selected via the file input.
   * @param event The input change event.
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  /**
   * Handles files dropped into the drop zone.
   * @param event The drag event.
   */
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  /**
   * Prevents the default behavior for dragover to allow dropping.
   * @param event The drag event.
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Placeholder for dragleave event handling.
   * @param event The drag event.
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Processes the array of selected files, creating previews.
   * @param files The array of files.
   */
  private handleFiles(files: File[]) {
    const processedFiles: ProcessedFile[] = files.map(file => {
      const processedFile: ProcessedFile = file;
      processedFile.previewUrl = URL.createObjectURL(file);
      return processedFile;
    });
    this.files.set(processedFiles);
  }

  // --- Step 3: Processing ---

  /**
   * Initiates the OCR processing for all uploaded files.
   */
  private async processFiles() {
    const filesToProcess = this.files();
    this.fileStatuses.set(filesToProcess.map(f => ({ name: f.name, status: 'pending', message: 'In queue...' })));

    let availableCredits = this.creditCount();

    for (let i = 0; i < filesToProcess.length; i++) {
      if (availableCredits <= 0) {
        this.updateStatus(i, 'error', 'Insufficient credits.');
        continue; // Skip processing if no credits are left
      }

      const file = filesToProcess[i];
      try {
        this.updateStatus(i, 'pending', 'Processing...');
        const result = await this.ocrService.extractText(file).toPromise();
        this.files.update(currentFiles => {
          currentFiles[i].result = result?.text;
          return [...currentFiles];
        });
        this.updateStatus(i, 'success', 'Completed');
        
        // Decrement credits after successful processing
        availableCredits--; 
        const user = await this.authService.user$.pipe(take(1)).toPromise();
        if (user) {
            const creditRef = doc(this.firestore, `credits/${user.uid}`);
            await setDoc(creditRef, { count: availableCredits });
        }

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        this.updateStatus(i, 'error', 'Failed');
      }
    }
  }

  /**
   * Updates the processing status for a specific file.
   * @param index The index of the file in the `fileStatuses` array.
   * @param status The new status.
   * @param message The status message.
   */
  private updateStatus(index: number, status: 'pending' | 'success' | 'error', message: string) {
    this.fileStatuses.update(statuses => {
      statuses[index] = { ...statuses[index], status, message };
      return [...statuses];
    });
  }

  // --- Step 4: Results and Preview ---

  /** Navigates to the next image in the carousel. */
  nextImage() {
    this.currentImageIndex.update(i => (i + 1) % this.files().length);
  }

  /** Navigates to the previous image in the carousel. */
  previousImage() {
    this.currentImageIndex.update(i => (i - 1 + this.files().length) % this.files().length);
  }

  /** Copies the extracted text of the current image to the clipboard. */
  copyText() {
    const text = this.currentImage()?.result;
    if (text) {
      navigator.clipboard.writeText(text);
    }
  }

  /** Downloads the extracted text of all processed files as a single text file. */
  downloadAllText() {
    let fullText = ``;
    this.files().forEach(file => {
      if (file.result) {
        fullText += `--- Image: ${file.name} ---\n`;
        fullText += file.result;
        fullText += `\n\n`;
      }
    });

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
