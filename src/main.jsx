import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BuggyProvider } from './context/BuggyContext';
import { initMockServiceWorker } from './services/mockApi';
import './styles/global.css';

// Register Service Worker for Network tab visibility (optional - app works without it)
initMockServiceWorker().catch((err) => {
  console.warn('[App] Service Worker registration failed:', err.message);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BuggyProvider>
      <App />
    </BuggyProvider>
  </React.StrictMode>
);
