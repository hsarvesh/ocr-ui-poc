
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OcrService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://asia-south1-akshar-bodh-drushti.cloudfunctions.net/akshar-chintan-v2';

  getTextFromImage(image: File, imageType: '1column' | '2column'): Observable<{ extracted_text: string }> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('image_type', imageType);

    return this.http.post<{ extracted_text: string }>(this.apiUrl, formData);
  }
}
