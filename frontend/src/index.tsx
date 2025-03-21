import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';


// Ensure 'root' is a valid HTML element before using it
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found. Make sure you have a <div id='root'></div> in your index.html file.");
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(
  <GoogleOAuthProvider clientId="652813948700-9rl6ubd2feohbnl16i1ndhph04hv59al.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
// Start performance measurement
reportWebVitals();
