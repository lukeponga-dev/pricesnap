import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure any cross-origin frame DOMExceptions from iframe embedding are safely suppressed
if (typeof window !== 'undefined') {
  const isCrossOriginFrameError = (err: any) => {
    if (!err) return false;
    const msg = String(err?.message || err?.reason || err || '');
    return (
      msg.includes("Failed to read a named property 'origin' from 'Location'") ||
      msg.includes('Blocked a frame with origin') ||
      msg.includes('cross-origin frame')
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      if (isCrossOriginFrameError(event.error || event)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isCrossOriginFrameError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
