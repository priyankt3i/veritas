# Veritas Report App

## Migration to Server-Side API

Currently, this application performs API calls directly from the browser for demonstration purposes. For a production application, you should move these calls to a backend server to protect your API key.

1.  **Backend Setup**: Create a NodeJS server or Serverless function.
2.  **Move Logic**: Copy the logic from `services/geminiService.ts` to your backend. Refer to `server/api.ts` for a template.
3.  **Environment Variables**: set `API_KEY` in your backend environment.
4.  **Update Frontend**: Modify `services/geminiService.ts` to `fetch` from your new backend endpoint instead of importing `GoogleGenAI` directly.
5.  **Cleanup**: Delete `services/geminiService.ts` logic related to direct API calls.
