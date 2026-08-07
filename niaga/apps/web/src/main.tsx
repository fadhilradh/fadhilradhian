import { ThemeProvider } from '@niaga/ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { I18nProvider } from './lib/i18n.js';
import { router } from './router.js';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Traders refresh a lot; a minute of staleness is invisible and keeps the
      // API's Fly.io machine from being woken for nothing.
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <RouterProvider router={router} />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
