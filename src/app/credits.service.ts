
import { Injectable, inject, signal } from '@angular/core';
import { doc, docData, Firestore, updateDoc, increment } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { User } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class CreditsService {
  private readonly firestore = inject(Firestore);
  private readonly authService = inject(AuthService);
  private currentUser: User | null = null;

  public readonly credits = signal(0);

  constructor() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        const creditRef = doc(this.firestore, `credits/${user.uid}`);
        docData(creditRef).subscribe((creditData: any) => {
          if (creditData) {
            this.credits.set(creditData.count);
          } else {
            this.credits.set(0);
          }
        });
      } else {
        this.credits.set(0);
      }
    });
  }

  async useCredits(amount: number): Promise<boolean> {
    if (!this.currentUser || this.credits() < amount) {
      return false;
    }

    const creditRef = doc(this.firestore, `credits/${this.currentUser.uid}`);
    try {
      await updateDoc(creditRef, {
        count: increment(-amount)
      });
      return true;
    } catch (error) {
      console.error('Failed to update credits:', error);
      return false;
    }
  }
}
