# HalleyX Analytics Dashboard

## Description
This is an analytics dashboard application with a React frontend and an Express.js backend.

## Setup Instructions

### Prerequisites
- Node.js (v20 or higher recommended)
- PostgreSQL database

### .env Configuration
Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="postgresql://user:password@host:port/database"
API_KEY="your_api_key_here"
DISABLE_HMR="true"
```

Replace the placeholder values with your actual database URL and API key.

### Install Dependencies
Navigate to the root directory of the project and run:
```bash
npm install
```

## How to Run the Application

### Development Mode
To run the application in development mode (both frontend and backend):

```bash
npm run dev
```

This will start the backend server and the frontend development server. The application should be accessible at `http://localhost:3006` (or the port specified in `backend/server.ts`).

### Build and Preview (Production-like)
To build the frontend for production and preview it:

```bash
npm run build
npm run preview
```

### Linting
To lint the frontend code:
```bash
npm run lint
```