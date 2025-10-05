
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrls: ['./image-upload.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploadComponent {
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement> | undefined;

  files = signal<File[]>([]);
  isDragging = signal(false);
  filesUploaded = output<File[]>();
  previous = output<void>();
  next = output<void>();

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  openFileDialog() {
    this.fileInput?.nativeElement.click();
  }

  addFiles(files: File[]) {
    this.files.update(existingFiles => [...existingFiles, ...files]);
    this.filesUploaded.emit(this.files());
  }

  removeFile(file: File) {
    this.files.update(files => files.filter(f => f !== file));
    this.filesUploaded.emit(this.files());
  }

  onPrevious() {
    this.previous.emit();
  }

  onNext() {
    this.next.emit();
  }
}
