import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  //I'm being a bit paranoid. From what I can gather, the settings below are the default settings, 
  //but I don't want to chance it and overshoot free tier limits while in beta.
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Refetch when user returns to tab
      refetchIntervalInBackground: false, // DO NOT poll while app is in background
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
