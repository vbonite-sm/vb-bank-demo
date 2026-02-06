import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BuggyProvider } from './context/BuggyContext';
import { initMockServiceWorker } from './services/mockApi';
import './styles/global.css';

// Wait for Service Worker to be ready before rendering app
// This ensures all API calls are visible in Network tab
const root = ReactDOM.createRoot(document.getElementById('root'));

initMockServiceWorker()
  .then(() => {
    console.log('[App] Service Worker ready - API calls will appear in Network tab');
    root.render(
      <React.StrictMode>
        <BuggyProvider>
          <App />
        </BuggyProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error('[App] Service Worker failed to initialize:', err);
    // Still render the app - it will work but without Network tab visibility
    root.render(
      <React.StrictMode>
        <BuggyProvider>
          <App />
        </BuggyProvider>
      </React.StrictMode>
    );
  });
