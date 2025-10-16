# Artful Place: Vite + React + Firebase Demo

This repository contains a minimal Vite + React app with Firebase (Firestore + Auth) initialized inside `src/App.jsx` to fit a single-file constraint while preserving the recommended architecture.

Quick start

1. Install dependencies:

   npm install

2. Provide Firebase globals before the app boots. In `index.html` (or a server), inject these globals on `window`:

```html
<script>
  window.__firebase_config = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    // ...other config
  };
  // optional: provide a custom token to sign in
  // window.__initial_auth_token = 'eyJhbGci...'
</script>
```

3. Run dev server:

   npm run dev

Notes

- For production, move Firebase initialization to `src/services/firebase.js`, auth hooks to `src/hooks/useAuth.js`, and pages to `src/pages/`.
- Add Tailwind or other styling as needed.
- Ensure Firestore rules allow the operations you perform during development.
