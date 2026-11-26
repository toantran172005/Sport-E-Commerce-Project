import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { purgeDeprecatedStorage } from './utils/storageCleanup.js';

// Dọn dẹp toàn bộ key mock/rác trong browser localStorage trước khi React render
purgeDeprecatedStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
