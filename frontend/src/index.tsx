import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import reportWebVitals from './reportWebVitals';



// Ensure 'root' is a valid HTML element before using it
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element not found. Make sure you have a <div id='root'></div> in your index.html file.");
}

const root = ReactDOM.createRoot(rootElement as HTMLElement);

root.render(<App />);

// Start performance measurement
reportWebVitals();
