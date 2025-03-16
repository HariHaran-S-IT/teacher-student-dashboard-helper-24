
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error handling for the application
const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
  console.error('Application Error:', error);
  console.error('Component Stack:', errorInfo.componentStack);
  // In a production app, you could log this to a service like Sentry
};

// Create root with error boundary
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
