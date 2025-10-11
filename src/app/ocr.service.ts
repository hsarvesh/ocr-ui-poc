import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry, map, delay } from 'rxjs/operators';

/**
 * The service for handling OCR processing.
 */
@Injectable({
  providedIn: 'root',
})
export class OcrService {
  // The Angular HTTP client.
  private readonly http = inject(HttpClient);
  // The URL of the OCR cloud function.
  private readonly ocrApiUrl = 'https://asia-south1-akshar-bodh-drushti.cloudfunctions.net/akshar-chintan-v2';

  /**
   * Extracts text from the given image by calling the cloud function.
   *
   * @param image The image file to extract text from.
   * @param imageType The layout type of the document ('1column' or '2column').
   * @returns An observable that emits an object containing the extracted text.
   */
  extractText(image: File, imageType: '1column' | '2column' | null): Observable<{ text: string }> {
    if (!imageType) {
      return throwError(() => new Error('Image type is not selected.'));
    }

    const formData = new FormData();
    formData.append('image', image);

    const url = `${this.ocrApiUrl}?image_type=${imageType}`;

    return this.http.post(url, formData, {
      headers: { 'Accept': 'text/plain' },
      responseType: 'text' // Expect a plain text response from the API.
    }).pipe(
      // Map the plain text response to the object structure the component expects.
      map(text => ({ text })),
      // Implement a retry strategy for transient errors.
      retry({
        count: 3, // Retry up to 3 times
        delay: (error: HttpErrorResponse, retryCount: number) => {
          // Only retry on 503 Service Unavailable or network errors, not on client-side errors.
          if (error.status === 503 || error.status === 0) {
            // Apply exponential backoff for delays (e.g., 2s, 4s, 8s).
            const delayTime = Math.pow(2, retryCount - 1) * 2000;
            return of(true).pipe(delay(delayTime));
          }
          // For other errors, don't retry.
          return throwError(() => error);
        }
      }),
      // Catch any final errors after retries are exhausted.
      catchError((error: HttpErrorResponse) => {
        console.error('OCR API call failed after retries:', error);
        return throwError(() => new Error('Failed to extract text from the image. Please try again.'));
      })
    );
  }
}
