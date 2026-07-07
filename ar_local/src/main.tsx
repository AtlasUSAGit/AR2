import React from 'react';
import ReactDOM from 'react-dom/client';

const originalStringify = JSON.stringify;
JSON.stringify = function(obj, replacer, space) {
  try {
    return originalStringify.call(this, obj, replacer, space);
  } catch (err: any) {
    if (err && err.message && err.message.includes("cyclic")) {
      const cache = new Set();
      const safeReplacer = (key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.has(value)) {
            return '[Circular]';
          }
          cache.add(value);
        }
        if (typeof replacer === 'function') {
          return replacer.call(this, key, value);
        }
        if (Array.isArray(replacer) && replacer.length > 0) {
          return replacer.includes(key) ? value : undefined;
        }
        return value;
      };
      try {
        return originalStringify.call(this, obj, safeReplacer, space);
      } catch (fallbackErr) {
        console.error("Fallback stringify also failed:", fallbackErr);
        return '{"error":"[Circular]"}';
      }
    }
    throw err;
  }
};

import App from './App.tsx';
import './index.css';
import { AppProvider } from './AppContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
