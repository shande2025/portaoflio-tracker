
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/components/ui/use-toast";
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await login(email, password);
      if (error) {
        if (error.message === 'Email not confirmed') {
          toast({ 
            title: "Correo no Confirmado", 
            description: "Por favor, confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada (y spam).", 
            variant: "destructive",
            duration: 7000 
          });
        } else if (error.message === 'Invalid login credentials') {
           toast({ 
            title: "Credenciales Inválidas", 
            description: "El correo electrónico o la contraseña son incorrectos. Por favor, inténtalo de nuevo.", 
            variant: "destructive",
            duration: 5000  
          });
        }
        else {
          toast({ title: "Error de Inicio de Sesión", description: error.message || "No se pudo iniciar sesión.", variant: "destructive" });
        }
        throw error; 
      }
      toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!" });
      navigate('/'); 
    } catch (error) {
      // Error ya manejado por los toasts específicos o el genérico
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error, data } = await signUp(email, password);
      if (error) {
        toast({ title: "Error de Registro", description: error.message || "No se pudo registrar la cuenta.", variant: "destructive" });
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Esto puede indicar que el usuario ya existe pero no está confirmado, o algún otro caso raro.
        // Supabase a veces devuelve un usuario sin identidades si el correo ya está registrado pero no confirmado.
        toast({ title: "Revisa tu Correo", description: "Si ya te has registrado, por favor confirma tu correo. Si no, intenta con otro correo.", variant: "default", duration: 7000 });
      }
      else {
        toast({ title: "Registro Exitoso", description: "¡Cuenta creada! Revisa tu correo para la confirmación.", duration: 7000 });
      }
    } catch (error) {
      toast({ title: "Error Inesperado", description: "Ocurrió un error durante el registro.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gradient-to-br from-slate-900 via-slate-800 to-background p-4"
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserPlus className="mr-2 h-4 w-4" /> Registrarse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleLogin} className="space-y-6 pt-6"
            >
              <div>
                <Label htmlFor="email-login" className="text-slate-300">Correo Electrónico</Label>
                <Input 
                  id="email-login" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password-login" className="text-slate-300">Contraseña</Label>
                <Input 
                  id="password-login" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Iniciar Sesión
              </Button>
            </motion.form>
          </TabsContent>
          <TabsContent value="signup">
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSignUp} className="space-y-6 pt-6"
            >
              <div>
                <Label htmlFor="email-signup" className="text-slate-300">Correo Electrónico</Label>
                <Input 
                  id="email-signup" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                  placeholder="tu@ejemplo.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password-signup" className="text-slate-300">Contraseña</Label>
                <Input 
                  id="password-signup" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="mt-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Registrarse
              </Button>
            </motion.form>
          </TabsContent>
        </Tabs>
        <div className="text-center text-slate-400 text-sm">
          <AlertCircle className="inline-block mr-1 h-4 w-4 -mt-0.5" />
          Si te registras, revisa tu correo (incluida la carpeta de spam) para confirmar tu cuenta.
        </div>
      </div>
    </motion.div>
  );
};

export default AuthPage;
