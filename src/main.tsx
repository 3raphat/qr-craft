import '@/index.css';

import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/App';
import { Toaster } from '@/components/ui/sonner.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AnimatePresence>
      <ThemeProvider
        attribute="class"
        enableSystem
      >
        <App />
      </ThemeProvider>
    </AnimatePresence>
    <Toaster />
  </StrictMode>
);
