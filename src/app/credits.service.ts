import { Injectable, inject, signal, effect } from '@angular/core';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

/**
 * The service for managing user credits.
 */
@Injectable({
  providedIn: 'root'
})
export class CreditsService {
  // The Firebase Firestore service for database operations.
  private readonly firestore = inject(Firestore);
  // The authentication service for user management.
  private readonly authService = inject(AuthService);

  // A signal that holds the user's credit count.
  readonly credits = signal(0);

  /**
   * The constructor for the CreditsService.
   * It sets up an effect to react to changes in the authentication state.
   */
  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        const creditRef = doc(this.firestore, `credits/${user.uid}`);
        docData(creditRef).subscribe((creditData: any) => {
          this.credits.set(creditData?.count ?? 0);
        });
      }
    });
  }

  /**
   * Decrements the user's credit count by the given amount.
   *
   * @param amount The amount to decrement the credit count by.
   */
  async useCredits(amount: number) {
    const user = this.authService.currentUser();
    if (user) {
      const creditRef = doc(this.firestore, `credits/${user.uid}`);
      const newCreditCount = this.credits() - amount;
      await setDoc(creditRef, { count: newCreditCount });
    }
  }
}
