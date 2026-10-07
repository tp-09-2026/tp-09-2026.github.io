import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// fonts are bundled with the site (no request to Google Fonts)
import '@fontsource-variable/inter-tight';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles/tokens.css';
import './styles/base.css';
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Chýba element #root v index.html');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
