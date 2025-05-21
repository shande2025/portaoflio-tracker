
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === 'SIGNED_IN') {
          toast({ title: "Sesión Iniciada", description: `Bienvenido de nuevo, ${session?.user?.email}` });
        } else if (event === 'SIGNED_OUT') {
          toast({ title: "Sesión Cerrada", description: "Has cerrado sesión." });
        } else if (event === 'USER_UPDATED') {
            if (session?.user && session.user.email_confirmed_at && !user?.email_confirmed_at) {
                 toast({ title: "Correo Confirmado", description: "Tu correo ha sido confirmado exitosamente.", variant: "default" });
            }
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [toast, user]);

  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setLoading(false);
        return { user: null, error };
    }
    setUser(data.user);
    setLoading(false);
    return { user: data.user, error: null };
  };

  const signUp = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
    });
    if (error) {
        setLoading(false);
        return { user: null, error };
    }
    
    setLoading(false);
    if (data.user && !data.user.email_confirmed_at) {
         toast({ 
            title: "¡Registro Exitoso!", 
            description: "Por favor, revisa tu correo electrónico (incluida la carpeta de spam) para confirmar tu cuenta y poder iniciar sesión.",
            duration: 10000,
            className: "bg-green-600 border-green-700 text-white"
        });
    }
    return { user: data.user, error: null };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        toast({ title: "Error al Cerrar Sesión", description: error.message, variant: "destructive" });
    }
    setUser(null);
    setLoading(false);
  };

  const value = {
    user,
    loading,
    login,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
