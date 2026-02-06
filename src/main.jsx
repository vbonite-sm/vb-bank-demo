import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BuggyProvider } from './context/BuggyContext';
import { initMockServiceWorker } from './services/mockApi';
import './styles/global.css';

// Register Service Worker so mock API calls appear in DevTools Network tab
initMockServiceWorker();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BuggyProvider>
      <App />
    </BuggyProvider>
  </React.StrictMode>
);
