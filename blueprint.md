# Project Overview

This project is an Optical Character Recognition (OCR) application that allows users to upload images and extract text from them. The application is built with Angular and leverages Firebase for authentication and data storage.

## Features

*   **User Authentication:** Users can sign in with their Google accounts.
*   **Image Upload:** Users can upload images to be processed.
*   **OCR Processing:** The application uses an OCR service to extract text from the uploaded images.
*   **Credit System:** New users are given 10 credits to use for OCR processing.

## Project Structure

*   `src/app/` - Contains the main application code.
    *   `app.config.ts` - The main application configuration.
    *   `app.component.ts` - The root component of the application.
    *   `app.routes.ts` - The application's routes.
    *   `auth.service.ts` - The service for handling user authentication.
    *   `ocr.service.ts` - The service for handling OCR processing.
    *   `firebase.config.ts` - The Firebase configuration.
    *   `login/` - Contains the login component.
    *   `image-processing/` - Contains the image processing component.