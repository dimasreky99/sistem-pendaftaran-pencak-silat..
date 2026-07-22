import { GoogleOAuthProvider } from '@react-oauth/google';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="133674038894-bokbsi2kg303mloukm190c52k7m90be9.apps.googleusercontent.com"><App /></GoogleOAuthProvider>
  </StrictMode>,
);
