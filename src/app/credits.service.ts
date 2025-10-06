
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {
  public readonly credits = signal(10); // Mock initial credits

  useCredits(amount: number): boolean {
    if (this.credits() >= amount) {
      this.credits.update(c => c - amount);
      return true;
    }
    return false;
  }
}
