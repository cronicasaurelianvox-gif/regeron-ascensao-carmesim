import './styles/main.css';
import './styles/auth-screen.css';
import './styles/adventure-hub.css';
import { createAuthScreen } from './ui/auth-screen.js';

const app = document.querySelector('#app');

if (app) {
  app.setAttribute('aria-live', 'polite');
  createAuthScreen();
}
