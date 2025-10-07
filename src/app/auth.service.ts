
import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

/**
 * The service for handling user authentication.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // The Firebase Authentication service.
  private readonly auth = inject(Auth);

  // The Firebase Firestore service.
  private readonly firestore = inject(Firestore);

  // The Angular router.
  private readonly router = inject(Router);

  // The Angular zone.
  private readonly ngZone = inject(NgZone);

  // An observable of the current user.
  readonly user$ = user(this.auth);

  /**
   * The constructor for the AuthService.
   */
  constructor() {
    // Subscribe to the user observable and redirect the user to the appropriate page.
    this.user$.subscribe(user => {
      this.ngZone.run(() => {
        if (user) {
          this.router.navigate(['/image-processing']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }

  /**
   * Logs the user in with Google.
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;

      if (user) {
        // Create a reference to the user's document in Firestore.
        const userRef = doc(this.firestore, `users/${user.uid}`);

        // Create a reference to the user's credit document in Firestore.
        const creditRef = doc(this.firestore, `credits/${user.uid}`);

        // Check if the user already exists in Firestore.
        docData(userRef).pipe(
          take(1)
        ).subscribe(userData => {
          if (!userData) {
            // If the user does not exist, create a new document for them.
            setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              providerId: credential.providerId,
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
            });

            // Give new users 10 credits.
            setDoc(creditRef, { count: 10 });
          }
        });
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  }

  /**
   * Logs the user out.
   */
  logout() {
    signOut(this.auth);
  }
}
