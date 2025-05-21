
import React from 'react';
import { motion } from 'framer-motion';
import { CandlestickChart, LogOut, UserCircle, PieChart as PieChartIcon, Settings, DollarSign, Euro, Coins, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { displayCurrency, changeDisplayCurrency, isLoadingRates } = useSettings();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/'); 
  };

  const availableCurrencies = [
    { code: 'USD', name: 'USD - Dólar Americano', icon: DollarSign },
    { code: 'EUR', name: 'EUR - Euro', icon: Euro },
    { code: 'PEN', name: 'PEN - Sol Peruano', icon: Coins },
    { code: 'JPY', name: 'JPY - Yen Japonés', icon: Coins },
    { code: 'GBP', name: 'GBP - Libra Esterlina', icon: Coins },
    { code: 'CAD', name: 'CAD - Dólar Canadiense', icon: Coins },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center cursor-pointer"
          onClick={() => navigate('/')}
        >
          <CandlestickChart className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Portafolio Tracker
          </span>
        </motion.div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
           {!authLoading && user && (
            <Link to="/charts" className="hidden sm:inline-flex">
              <Button variant="ghost" className="text-slate-300 hover:text-primary hover:bg-slate-700/50">
                <PieChartIcon className="h-5 w-5 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Gráficos</span>
              </Button>
            </Link>
          )}

          {!authLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 sm:py-2 text-slate-300 hover:text-primary hover:bg-slate-700/50">
                  <Settings className="h-5 w-5" />
                   <span className="hidden sm:inline ml-2">Ajustes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="end">
                <DropdownMenuLabel>Moneda de Visualización</DropdownMenuLabel>
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer hover:bg-slate-700/70 focus:bg-slate-700/70">
                        {isLoadingRates ? "Cargando..." : displayCurrency}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-slate-200">
                            {availableCurrencies.map(currency => (
                                <DropdownMenuItem 
                                    key={currency.code} 
                                    onClick={() => changeDisplayCurrency(currency.code)}
                                    className="cursor-pointer hover:bg-slate-700/70 focus:bg-slate-700/70"
                                >
                                    <currency.icon className="mr-2 h-4 w-4" />
                                    {currency.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-slate-700 my-1" />
                 <DropdownMenuItem onClick={() => navigate('/charts')} className="cursor-pointer hover:bg-slate-700/70 focus:bg-slate-700/70 sm:hidden">
                    <PieChartIcon className="mr-2 h-4 w-4" />
                    <span>Gráficos</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!authLoading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <UserCircle className="h-6 w-6 text-slate-300 hover:text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Conectado como</p>
                    <p className="text-xs leading-none text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700"/>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 hover:!text-red-300 hover:!bg-red-700/30 focus:!bg-red-700/50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {!authLoading && !user && (
            <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 hover:text-sky-300"
                onClick={() => navigate('/auth')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Iniciar Sesión / Registrarse
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
