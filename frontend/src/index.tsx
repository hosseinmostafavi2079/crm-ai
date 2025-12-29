import React from 'react';
import ReactDOM from 'react-dom/client';
// Ensure App is imported correctly based on your file structure
// Since this file is in frontend/src/, and App.tsx is in frontend/src/, the path is ./App
import App from './App'; 

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);