
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer, throwError } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://asia-south1-akshar-bodh-drushti.cloudfunctions.net/akshar-chintan-v2';

  getTextFromImage(image: File, imageType: '1column' | '2column'): Observable<string> {
    const url = `${this.apiUrl}?image_type=${imageType}`;

    const formData = new FormData();
    formData.append('image', image);

    return this.http.post(url, formData, { responseType: 'text' }).pipe(
      timeout(30000), // 30-second timeout
      retry({
        count: 3,
        delay: (error: any, retryCount: number) => {
          if ((error instanceof HttpErrorResponse && error.status === 503) || error.name === 'TimeoutError') {
            const delayTime = Math.pow(2, retryCount - 1) * 2000;
            return timer(delayTime);
          }
          return throwError(() => error);
        },
      })
    );
  }
}
