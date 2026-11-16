import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Purge legacy mock data from browser localStorage on startup
try {
  const LEGACY_MOCK_KEYS = [
    'sport_cart',
    'sport_selected_cart',
    'sport_wishlist',
    'sport_orders',
    'sport_user_addresses',
    'sport_staff',
  ];
  LEGACY_MOCK_KEYS.forEach((k) => localStorage.removeItem(k));
} catch {
  // ignore in non-browser or sandbox environments
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
