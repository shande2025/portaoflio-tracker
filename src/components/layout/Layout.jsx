
import React from 'react';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-slate-900 text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t border-slate-800">
        <div className="container mx-auto text-center text-sm text-slate-400">
          © {new Date().getFullYear()} Portafolio Tracker. Todos los derechos reservados.
        </div>
      </footer>
      <Toaster />
    </div>
  );
};

export default Layout;
