import { Injectable, inject, signal, effect } from '@angular/core';
import { doc, docData, Firestore, setDoc, collection, addDoc, serverTimestamp, query, orderBy } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface CreditTransaction {
  amount: number;
  type: 'add' | 'spend';
  description: string;
  timestamp: any;
}

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
   * Adds the given amount to the user's credit count.
   *
   * @param amount The amount to add to the credit count.
   * @param description A description of the transaction.
   */
  async addCredits(amount: number, description: string) {
    const user = this.authService.currentUser();
    if (user) {
      const newCreditCount = this.credits() + amount;
      await this.logTransaction({
        amount,
        type: 'add',
        description,
        timestamp: serverTimestamp(),
      });
      const creditRef = doc(this.firestore, `credits/${user.uid}`);
      await setDoc(creditRef, { count: newCreditCount });
    }
  }

  /**
   * Decrements the user's credit count by the given amount.
   *
   * @param amount The amount to decrement the credit count by.
   * @param description A description of the transaction.
   */
  async useCredits(amount: number, description: string) {
    const user = this.authService.currentUser();
    if (user && this.credits() >= amount) {
      const newCreditCount = this.credits() - amount;
      await this.logTransaction({
        amount,
        type: 'spend',
        description,
        timestamp: serverTimestamp(),
      });
      const creditRef = doc(this.firestore, `credits/${user.uid}`);
      await setDoc(creditRef, { count: newCreditCount });
    } else {
      throw new Error('Insufficient credits.');
    }
  }

  /**
   * Retrieves the user's transaction history.
   *
   * @returns An observable of the user's transaction history.
   */
  getTransactions(): Observable<CreditTransaction[]> {
    const user = this.authService.currentUser();
    if (user) {
      const transactionsRef = collection(this.firestore, `credits/${user.uid}/transactions`);
      const q = query(transactionsRef, orderBy('timestamp', 'desc'));
      return collectionData(q) as Observable<CreditTransaction[]>;
    }
    return new Observable<CreditTransaction[]>(observer => observer.next([]));
  }

  /**
   * Logs a credit transaction in Firestore.
   *
   * @param transaction The transaction to log.
   */
  private async logTransaction(transaction: CreditTransaction) {
    const user = this.authService.currentUser();
    if (user) {
      const transactionsRef = collection(this.firestore, `credits/${user.uid}/transactions`);
      await addDoc(transactionsRef, transaction);
    }
  }
}
