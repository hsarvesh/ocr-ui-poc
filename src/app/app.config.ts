import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from './firebase.config';

/**
 * The main application configuration.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Provides the application with routing capabilities.
    provideRouter(routes),

    // Provides the application with HTTP client capabilities.
    provideHttpClient(),

    // Initializes and provides the Firebase application instance.
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // Initializes and provides the Firebase Authentication service.
    provideAuth(() => getAuth()),

    // Initializes and provides the Firebase Firestore service.
    provideFirestore(() => getFirestore()),
  ],
};
