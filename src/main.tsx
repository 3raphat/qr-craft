import '@/index.css';

import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { Toaster } from '@/components/ui/sonner.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      enableSystem
    >
      <App />
    </ThemeProvider>
    <Toaster />
  </StrictMode>
);
