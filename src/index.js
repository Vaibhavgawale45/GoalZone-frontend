// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!googleClientId) {
    console.error("FATAL ERROR: REACT_APP_GOOGLE_CLIENT_ID is not defined in your .env file. Google Sign-In will not work.");
    // You might even want to render an error message to the screen here.
}

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ""}> {/* Ensure clientId is always passed, even if empty from env */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);