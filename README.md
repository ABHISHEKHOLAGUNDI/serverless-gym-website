# Gym Management System

A comprehensive gym management application built with React, Vite, and Cloudflare Pages.

## Features

-   **Dashboard**: Real-time metrics (Live Members, Income, Expiring Soon, Birthdays).
-   **Member Management**: Add, Edit, Renew, Delete members.
-   **Financials**: Track Income and Expenses.
-   **Trainers**: Manage gym trainers.
-   **Maintenance**: Track equipment status.
-   **WhatsApp Integration**: Send invoices, birthday wishes, and renewal reminders.

## Setup & Deployment

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the production-ready files.

4.  **Deployment**:
    -   You can deploy the `dist` folder to any static hosting provider like **Vercel**, **Netlify**, or **Cloudflare Pages**.
    -   Since this is a client-side app (SPA), ensure your host is configured to rewrite all routes to `index.html`.

## Recent Updates

-   **Birthday Feature**: Automatically detects birthdays and shows a cake icon to send a WhatsApp wish.
-   **Fee Tracking**: Adding a member or renewing a membership automatically logs the income in the Financials section.
-   **Data Cleanup**: All demo data has been removed. The app starts fresh.
