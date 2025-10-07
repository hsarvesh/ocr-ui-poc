import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * The service for handling OCR processing.
 */
@Injectable({
  providedIn: 'root',
})
export class OcrService {
  // The Angular HTTP client.
  private readonly http = inject(HttpClient);

  /**
   * Extracts text from the given image.
   *
   * @param image The image to extract text from.
   */
  extractText(image: File) {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<{ text: string }>('/api/ocr', formData);
  }
}
