
import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { doc, docData, Firestore, setDoc } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  readonly user$ = user(this.auth);

  constructor() {
    this.user$.subscribe(user => {
      // By wrapping this navigation in `ngZone.run()`, we ensure that the routing
      // is executed back inside Angular's zone, which will trigger change detection
      // and prevent the "outside of an Injection context" warning.
      this.ngZone.run(() => {
        if (user) {
          this.router.navigate(['/image-processing']);
        } else {
          this.router.navigate(['/login']);
        }
      });
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(this.auth, provider);
      const user = credential.user;
      if (user) {
        const userRef = doc(this.firestore, `users/${user.uid}`);
        docData(userRef).pipe(take(1)).subscribe(userData => {
          if (!userData) {
            setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              providerId: credential.providerId,
              creationTime: user.metadata.creationTime,
              lastSignInTime: user.metadata.lastSignInTime,
            });
          }
        });
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  }

  logout() {
    signOut(this.auth);
  }
}
