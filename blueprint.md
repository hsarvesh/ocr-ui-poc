
# OCR UI POC Blueprint

## Overview

This application is a proof-of-concept for an Optical Character Recognition (OCR) service. It allows users to authenticate using their Google account, upload one or more images, and submit them to a cloud function for text extraction. The application is built with Angular and leverages Firebase for authentication, Firestore for data storage, and a credit-based system for service usage.

## Implemented Features

### Authentication
- Google Sign-In authentication flow.
- Secure routing to protect the image processing page.
- Automatic creation of user documents in Firestore upon first login.
- User menu with logout functionality.

### Image Processing Workflow
- **Step 1: Layout Selection:** Users can choose between a single or two-column layout for the images they are about to upload.
- **Step 2: Image Upload:** A drag-and-drop interface for uploading multiple images.
- **Step 3: Processing & Results:** A view to show the status of the image processing and display the extracted text results.

### Credit Management
- New users are granted 10 free credits upon their first login.
- The user's current credit balance is displayed in the user menu.
- The `CreditsService` manages credit balance from a `credits` collection in Firestore.
- The `useCredits` method in `CreditsService` decrements credits in Firestore.

### Styling and Design
- A modern, clean user interface with a consistent theme.
- A responsive design that adapts to different screen sizes.
- A user menu component displaying user information and credit balance.
- Custom-styled components, including buttons, layout selectors, and file upload areas.
- An animated gradient effect for the main title.

## Current Task: Implement User Menu and Credit Management System (Completed)

This task involved creating a user menu in the application's header that displays user information and credit balance. It also included implementing a credit management system that integrates with Firestore.

### Plan (Completed)

1.  **UI Implementation:**
    - Created a new `UserMenuComponent` to display the user's name, email, and available credits.
    - Added a dropdown menu to the `UserMenuComponent` with options for:
        - Add Credits
        - Manage Credits
        - Processing History
        - Sign Out
2.  **Credit Service and Firestore Integration:**
    - Updated the `CreditsService` to fetch and manage user credits from a `credits` collection in Firestore.
    - Modified the `AuthService` to initialize 10 credits for new users in Firestore upon their first login.
3.  **Routing and Navigation:**
    - The navigation for "Add Credits", "Manage Credits", and "Processing History" has been deferred to a future task.
4.  **Final Touches and Build:**
    - Styled the new `UserMenuComponent`.
    - Successfully ran `ng build` to ensure all changes are implemented correctly.
