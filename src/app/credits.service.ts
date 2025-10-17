import { Injectable, inject, signal, effect } from '@angular/core';
import { doc, docData, Firestore, collection, addDoc, serverTimestamp, query, orderBy, runTransaction } from '@angular/fire/firestore';
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
 * Custom error class for when a user has insufficient credits.
 */
export class InsufficientCreditsError extends Error {
  constructor(message?: string) {
    super(message || 'Insufficient credits.');
    this.name = 'InsufficientCreditsError';
  }
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
   * It sets up an effect to react to changes in the authentication state to fetch and update the credit count.
   */
  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        const creditRef = doc(this.firestore, `credits/${user.uid}`);
        // Subscribe to real-time updates of the user's credit document.
        docData(creditRef).subscribe((creditData: any) => {
          this.credits.set(creditData?.count ?? 0);
        });
      } else {
        // Reset credits if no user is logged in.
        this.credits.set(0);
      }
    });
  }

  /**
   * Adds the given amount to the user's credit count via a Firestore transaction.
   * A transaction record is also created.
   *
   * @param amount The amount to add to the credit count. Must be a positive number.
   * @param description A description of the transaction.
   * @returns A Promise that resolves with the new credit balance.
   * @throws Error if no user is logged in or if the transaction fails.
   */
  async addCredits(amount: number, description: string): Promise<number> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('User not logged in.');
    }

    // For regular users, amount must be positive. This check is bypassed for the special user.
    if (user.email !== 'sarvesh@uttarayanam.com' && amount <= 0) {
      throw new Error('Amount to add must be positive.');
    }

    const userId = user.uid;
    const creditRef = doc(this.firestore, `credits/${userId}`);
    const transactionsCollectionRef = collection(this.firestore, `credits/${userId}/transactions`);

    try {
      const newBalance = await runTransaction(this.firestore, async (transaction) => {
        const creditDoc = await transaction.get(creditRef);
        const currentCredits = creditDoc.exists() ? (creditDoc.data() as any).count : 0;
        
        let updatedCredits: number;
        let transactionAmount: number;
        let transactionDescription: string;

        if (user.email === 'sarvesh@uttarayanam.com') {
          updatedCredits = 100;
          transactionAmount = Math.max(0, 100 - currentCredits); // Ensure transaction amount is not negative
          transactionDescription = 'Special credit for Sarvesh';
        } else {
          updatedCredits = currentCredits + amount;
          transactionAmount = amount;
          transactionDescription = description;
        }

        // Update user's credit balance
        transaction.set(creditRef, { count: updatedCredits });

        // Add transaction record
        const newTransactionRef = doc(transactionsCollectionRef);
        transaction.set(newTransactionRef, {
          amount: transactionAmount,
          type: 'add',
          description: transactionDescription,
          timestamp: serverTimestamp()
        });

        return updatedCredits;
      });

      this.credits.set(newBalance);
      return newBalance;
    } catch (error: unknown) {
      console.error('Error adding credits in transaction:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to add credits: ${error.message}`);
      } else {
        throw new Error('Failed to add credits: Unknown error');
      }
    }
  }


  /**
   * Decrements the user's credit count by the given amount via a Firestore transaction.
   * A transaction record is also created. Checks for sufficient credits before deduction.
   *
   * @param amount The amount to decrement the credit count by. Must be a positive number.
   * @param description A description of the transaction.
   * @returns A Promise that resolves with the new credit balance.
   * @throws InsufficientCreditsError if the user does not have enough credits.
   * @throws Error if no user is logged in or if the transaction fails.
   */
  async useCredits(amount: number, description: string): Promise<number> {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('User not logged in.');
    }
    if (amount <= 0) {
      throw new Error('Amount to use must be positive.');
    }

    const userId = user.uid;
    const creditRef = doc(this.firestore, `credits/${userId}`);
    const transactionsCollectionRef = collection(this.firestore, `credits/${userId}/transactions`);

    try {
      const newBalance = await runTransaction(this.firestore, async (transaction) => {
        const creditDoc = await transaction.get(creditRef);
        const currentCredits = creditDoc.exists() ? (creditDoc.data() as any).count : 0;

        if (currentCredits < amount) {
          throw new InsufficientCreditsError();
        }

        const updatedCredits = currentCredits - amount;

        // Update user's credit balance
        transaction.set(creditRef, { count: updatedCredits });

        // Add transaction record
        const newTransactionRef = doc(transactionsCollectionRef);
        transaction.set(newTransactionRef, {
          amount,
          type: 'spend',
          description,
          timestamp: serverTimestamp()
        });

        return updatedCredits;
      });

      this.credits.set(newBalance);
      return newBalance;
    } catch (error: unknown) {
      if (error instanceof InsufficientCreditsError) {
        throw error; // Re-throw custom error
      }
      console.error('Error using credits in transaction:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to use credits: ${error.message}`);
      } else {
        throw new Error('Failed to use credits: Unknown error');
      }
    }
  }

  /**
   * Retrieves the user's credit transaction history.
   *
   * @returns An Observable of an array of CreditTransaction objects, ordered by timestamp (descending).
   */
  getTransactions(): Observable<CreditTransaction[]> {
    const user = this.authService.currentUser();
    if (user) {
      const transactionsCollectionRef = collection(this.firestore, `credits/${user.uid}/transactions`);
      const transactionsQuery = query(transactionsCollectionRef, orderBy('timestamp', 'desc'));
      return collectionData(transactionsQuery, { idField: 'id' }) as Observable<CreditTransaction[]>;
    }
    // If no user is logged in, return an observable that immediately emits an empty array.
    return new Observable<CreditTransaction[]>(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}
