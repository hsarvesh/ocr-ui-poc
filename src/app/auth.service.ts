import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
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
        const userId = user.uid;
        // Create a reference to the user's document in Firestore.
        const userRef = doc(this.firestore, `users/${userId}`);
        // Create a reference to the user's credit document in Firestore.
        const creditRef = doc(this.firestore, `credits/${userId}`);
        // Create a reference to the user's transactions subcollection.
        const transactionsRef = collection(this.firestore, `credits/${userId}/transactions`);

        // Check if the user document already exists in Firestore.
        docData(userRef).pipe(
          take(1)
        ).subscribe(async userData => {
          if (!userData) {
            // If the user does not exist, create a new document for them.
            await setDoc(userRef, {
              uid: userId,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              providerId: credential.providerId,
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
            });

            // Check if the credits document exists, and if not, initialize credits and log transaction.
            const creditDoc = await docData(creditRef).pipe(take(1)).toPromise();
            if (!creditDoc) {
              // Give new users 10 credits and log it as a transaction.
              await setDoc(creditRef, { count: 10 });
              await addDoc(transactionsRef, {
                amount: 10,
                type: 'add',
                description: 'Initial credit grant',
                timestamp: serverTimestamp()
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error during Google login:', error);
      // Optionally throw the error to be handled by the component
      throw error;
    }
  }

  /**
   * Logs the user out.
   */
  logout() {
    signOut(this.auth);
  }
}
