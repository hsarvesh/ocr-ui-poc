# Project Overview

This project is an Optical Character Recognition (OCR) application that allows users to upload images and extract text from them. The application is built with Angular and leverages Firebase for authentication and data storage.

## Implemented Features

*   **User Authentication:** Users can sign in with their Google accounts.
*   **Image Upload & OCR:** A multi-step workflow allows users to select a layout, upload images, and process them to extract text.
*   **Credit System:** New users receive an initial credit balance, which is decremented upon using the OCR service.
*   **Modern UI:** A clean, responsive interface with a consistent design language.

## Current Task: Full Project Review and Refactoring (Completed)

This task involved a comprehensive review of the entire project to identify areas for improvement and implement changes to align the codebase with the highest standards of modern Angular development.

### Phase 1: Architectural Refactoring & State Unification (Completed)
*   **Goal:** Create a robust and reusable application shell and convert the primary state management to be signal-first.
*   **Steps:**
    1.  **Consolidate Root Component:** Renamed and consolidated `app.ts`, `app.html`, and `app.css` into the standard `app.component.ts`, `app.component.html`, and `app.component.css` files.
    2.  **Create App Shell:** Implemented a proper application shell in `app.component.html` that includes a persistent header containing the application title and user menu.
    3.  **Create `UserMenuComponent`:** Created a new, dedicated, and reusable component for the user dropdown menu, including its own template and styles.
    4.  **Signal-Based Auth:** Refactored `AuthService` to expose the current user as a `signal` (`currentUser`) instead of an `Observable` (`user$`).
    5.  **Component-Led Navigation:** Moved the navigation logic from the `AuthService` constructor to the `AppComponent`, which now reacts to changes in the new `currentUser` signal.

### Phase 2: Component & Service Cleanup (Completed)
*   **Goal:** Refactor the rest of the application to align with the new signal-based architecture.
*   **Steps:**
    1.  Updated the `ImageProcessingComponent` and `LoginComponent` to consume the new `currentUser` signal from the `AuthService`.
    2.  Removed the now-redundant header code from the `ImageProcessingComponent`'s template.
    3.  Refactored `CreditsService` to react to the new `currentUser` signal, removing the need for a manual subscription in its constructor.
