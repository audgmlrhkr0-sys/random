import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import './index.css';

const root = document.getElementById('root');

try {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </ErrorBoundary>
    </StrictMode>
  );
} catch (err) {
  root.innerHTML =
    '<div style="padding:2rem;text-align:center;font-family:sans-serif">' +
    '<h1>시작 오류</h1><p>' +
    (err.message || err) +
    '</p></div>';
}
