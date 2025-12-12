
# Veritas Report App

## Project Setup

This is a **Client-Server** application designed to be hosted on Vercel.

### 1. Environment Variables
You must configure your Gemini API Key securely on the server.
- Create a `.env` file in the root directory (for local development).
- Add: `API_KEY=your_google_ai_studio_key`
- **Important:** Do not prefix with `VITE_` or `REACT_APP_` as this key is now used exclusively by the server-side API (`api/generate.ts`).

### 2. Development
To run this project locally with the serverless API functions working, you should use the Vercel CLI.

```bash
npm i -g vercel
vercel dev
```
This will start both the React frontend and the `/api` functions.

### 3. Architecture
- **Frontend (`/src` or root)**: React application that calls `/api/generate`.
- **Backend (`/api`)**: Vercel Serverless Function that handles the Gemini API logic. This ensures your API key remains hidden from the client browser.
    