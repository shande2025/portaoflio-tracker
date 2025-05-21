
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import DashboardPage from '@/pages/DashboardPage';
import AuthPage from '@/pages/AuthPage';
import ChartsPage from '@/pages/ChartsPage';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const LoadingScreen = ({ message }) => (
  <div className="flex flex-col justify-center items-center h-screen bg-background">
    <Loader2 className="animate-spin h-16 w-16 text-primary mb-4" />
    <p className="text-xl text-slate-300">{message}</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }
  return user ? children : <Navigate to="/auth" replace />;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Cargando aplicación..." />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<DashboardPage />} />
        <Route 
          path="/charts"
          element={
            <ProtectedRoute>
              <ChartsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const AppRoutes = () => {
    return <AppContent />;
}

export default AppRoutes;
