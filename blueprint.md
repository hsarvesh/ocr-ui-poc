
# Project Blueprint

## Overview

This project is an OCR (Optical Character Recognition) UI built with Angular. It allows users to authenticate using their Google account and guides them through a multi-step process to process images.

## Implemented Features

*   **Authentication:**
    *   Firebase authentication with Google Sign-In.
    *   Users can log in and out.
*   **Image Processing Workflow:**
    *   A multi-step UI that is displayed after the user logs in.
    *   **Step 1: Select Layout:**
        *   A stepper component showing 4 steps: "Select Layout", "Upload Images", "Processing", and "Preview & Results".
        *   A "Select Document Layout" section with options for "Single Column" and "Two Columns".
        *   The layout options are interactive, and the selected option is highlighted.
        *   A "Next" button to proceed to the next step.
    *   **Step 2: Upload Images:**
        *   A new `image-upload` component is created for the second step.
        *   The `image-processing` component conditionally displays the `image-upload` component when the user is on step 2.
        *   The UI for the `image-upload` component includes a drag-and-drop area for uploading files, a "Browse Files" button, and "Previous" and "Next" buttons.
        *   Users can select files by clicking the "Browse Files" button or by dragging and dropping them onto the drop zone.
        *   A list of selected files is displayed, and users can remove files from the list.
        *   The "Previous" button navigates the user back to the "Select Layout" step.
*   **UI:**
    *   The main login page has a simple UI with the text "OCR-UI" centered and animated with a colorful gradient.
    *   A "Login with Google" button.
*   **Build Configuration:**
    *   The build output path is set to `dist/cloudflare` to support Cloudflare Pages deployment.

## Current Goal

The next step is to implement the "Next" button functionality in the `image-upload` component. This will involve emitting the list of uploaded files to the parent `image-processing` component and navigating to the "Processing" step. Also, I will add the functionality to the logout button.
