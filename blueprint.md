
# OCR UI POC Blueprint

## Overview

This application is a proof-of-concept for an Optical Character Recognition (OCR) service. It allows users to authenticate using their Google account, upload one or more images, and submit them to a cloud function for text extraction. The application is built with Angular and leverages Firebase for authentication and backend services.

## Implemented Features

### Authentication
- Google Sign-In authentication flow.
- Secure routing to protect the image processing page.
- Automatic creation of user documents in Firestore upon first login.

### Image Processing Workflow
- **Step 1: Layout Selection:** Users can choose between a single or two-column layout for the images they are about to upload.
- **Step 2: Image Upload:** A drag-and-drop interface for uploading multiple images.
- **Step 3: Processing & Results:** A view to show the status of the image processing and display the extracted text results.

### Styling and Design
- A modern, clean user interface.
- A responsive design that works on different screen sizes.
- Custom-styled components, including buttons, layout selectors, and file upload areas.
- An animated gradient effect for the main title.

## Current Task: Fix File Upload Functionality

The application is currently not allowing users to upload images by clicking on the upload area; only drag-and-drop is working. This is a critical bug that needs to be fixed to provide a complete user experience.

### Plan

1.  **Modify `image-processing.html`:**
    - Add a hidden file input element (`<input type="file">`) to the template.
    - Add a click handler to the drop zone that programmatically triggers a click on the file input element.
2.  **Update `ImageProcessingComponent`:**
    - Add a method to handle the file selection from the file input.
    - This method will take the selected files, create preview URLs, and update the `files` signal.
3.  **Verify and Build:**
    - Run `ng build` to ensure the fix is implemented correctly and does not introduce any new errors.
