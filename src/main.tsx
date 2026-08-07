import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CountryProvider } from './context/CountryContext';
import { ThemeProvider } from './context/ThemeContext';
const CLIENT_ID = "1026314243005-vlfm82hohdnihhbd7ndi4g71tgb1n1c8.apps.googleusercontent.com";
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={CLIENT_ID}>
        <ThemeProvider>
          <CountryProvider>
            <App />
          </CountryProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
