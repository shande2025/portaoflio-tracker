
import React from 'react';
import AppProviders from '@/components/layout/AppProviders';
import AppRoutes from '@/routes/AppRoutes';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <AppProviders>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-background text-slate-100">
        <AppRoutes />
        <Toaster />
      </div>
    </AppProviders>
  );
}

export default App;
