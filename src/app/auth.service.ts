import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
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
  
  // A signal that holds the current user.
  readonly currentUser = signal<User | null>(null);

  /**
   * The constructor for the AuthService.
   */
  constructor() {
    onAuthStateChanged(this.auth, user => {
      this.currentUser.set(user);
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
