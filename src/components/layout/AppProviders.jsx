
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider as RadixTooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SettingsProvider>
            <RadixTooltipProvider delayDuration={100}>
              {children}
            </RadixTooltipProvider>
          </SettingsProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default AppProviders;
