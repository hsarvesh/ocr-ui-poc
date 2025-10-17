# Project Overview

This project is an Optical Character Recognition (OCR) application that allows users to upload images and extract text from them. The application is built with Angular and leverages Firebase for authentication and data storage.

## Implemented Features

*   **User Authentication:** Users can sign in with their Google accounts.
*   **Image Upload & OCR:** A multi-step workflow allows users to select a layout, upload images, and process them to extract text.
*   **Credit System:** New users receive an initial credit balance, which is decremented upon using the OCR service.
*   **Modern UI:** A clean, responsive interface with a consistent design language.

## Current Task: Implement Credit-Based Monetization System (Client-Side Transactions)

This task involves implementing a complete credit-based monetization system for the OCR application, covering viewing balances, purchasing credits, deducting credits for OCR usage, and viewing transaction history. This will utilize Firestore's atomic transaction capabilities directly within the client-side `CreditsService`.

### Phase 1: Client-Side Credit Management (`CreditsService` Refactor)
*   **Goal:** Implement atomic credit management directly in `CreditsService` using Firestore transactions, and enhance transaction logging.
*   **Steps:**
    1.  **Refactor `CreditsService`:**
        *   Modify `addCredits(amount, description)`:
            *   Use a Firestore transaction to:
                *   Fetch the user's current `credits` document.
                *   Calculate `newBalance = currentBalance + amount`.
                *   Update the `credits/{userId}` document (`count` field) with `newBalance`.
                *   Add a new document to the `credits/{userId}/transactions` subcollection with `amount`, `type: 'add'`, `description`, and `serverTimestamp()`.
            *   Update the `credits` signal with the `newBalance`.
            *   Implement robust error handling.
        *   Modify `useCredits(amount, description)`:
            *   Use a Firestore transaction to:
                *   Fetch the user's current `credits` document.
                *   Check `currentBalance >= amount`. If not, abort the transaction and throw an `InsufficientCreditsError`.
                *   Calculate `newBalance = currentBalance - amount`.
                *   Update the `credits/{userId}` document (`count` field) with `newBalance`.
                *   Add a new document to the `credits/{userId}/transactions` subcollection with `amount`, `type: 'spend'`, `description`, and `serverTimestamp()`.
            *   Update the `credits` signal with the `newBalance`.
            *   Implement robust error handling, specifically for `InsufficientCreditsError`.
    2.  **`AuthService` Update:** Ensure the initial credit setup for new users (defaulting to 10 credits) is done using `setDoc` with an initial `timestamp` and `description` to keep it consistent with the new transaction logging.

### Phase 2: Client-Side Integration - UI Updates
*   **Goal:** Implement the "Add Credits" and "View Transactions" UI, and update the OCR logic for credit deduction.
*   **Steps:**
    1.  **`AddCreditsComponent`:**
        *   Implement UI for purchasing 50 credits (e.g., a button).
        *   On button click, call `creditsService.addCredits(50, 'Credit Purchase')`.
        *   Display success/error messages to the user.
    2.  **`ViewTransactionsComponent`:**
        *   Fetch and display transaction history using `creditsService.getTransactions()`.
        *   Render a list of transactions, showing `amount`, `type`, `description`, and `timestamp` (formatted for display).
    3.  **`ImageProcessingComponent`:**
        *   **Crucial Update:** In `processFiles()`, *before* calling `ocrService.extractText()` for each image:
            *   Call `creditsService.useCredits(1, 'OCR Scan')`.
            *   **Handle `InsufficientCreditsError`:** If `creditsService.useCredits` throws this error, log it, update the `fileStatus` for the current image with an error message indicating insufficient credits, and `continue` to the next image (or break if no more credits are expected).
            *   Update UI feedback for credit deduction status.
