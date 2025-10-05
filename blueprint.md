
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

## Current Task: Fix Image Processing Logic

The application is currently not processing the uploaded images. The user is advanced to the results step without the `processImages()` function ever being called.

### Plan

1.  **Modify `ImageProcessingComponent`:** Update the `nextStep()` method in `image-processing.ts`.
    - When the user is on `currentStep() === 2` (the image upload step) and clicks "Next", the `processImages()` function must be called.
2.  **Implement Concurrent Processing:** Modify the `processImages()` function to use `forkJoin` from RxJS. This will allow all uploaded images to be processed in parallel, improving performance and user experience.
3.  **Provide User Feedback:** Ensure the `isProcessing` signal is correctly used to show a loading state while the images are being processed and any potential errors are displayed to the user.
