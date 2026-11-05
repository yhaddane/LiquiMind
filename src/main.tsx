import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Workbox PWA service worker with offline caching strategy
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('LiquiMind Workbox SW active. Scope:', registration.scope);

        // Check for worker updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('Nouveau contenu disponible en cache (Workbox).');
                } else {
                  console.log('Contenu mis en cache pour le mode hors-ligne.');
                }
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('LiquiMind SW registration failed or skipped:', err?.message || err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
