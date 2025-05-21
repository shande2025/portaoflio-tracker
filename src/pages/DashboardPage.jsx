
import React from 'react';
import AddTransactionForm from '@/components/portfolio/AddTransactionForm';
import PortfolioTable from '@/components/portfolio/PortfolioTable';
import usePortfolio from '@/hooks/usePortfolio';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatters';
import { useSettings } from '@/contexts/SettingsContext';
import { Loader2, TrendingUp, TrendingDown, DollarSign, Bitcoin, Landmark, AlertTriangle, Activity, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, pl, isLoading, icon, type, tagline }) => {
    const { displayCurrency, getConvertedValue } = useSettings();
    
    const fc = (val) => formatCurrency(val, displayCurrency, getConvertedValue);

    const plColor = getConvertedValue(pl) >= 0 ? 'text-green-400' : 'text-red-400';
    const PlIcon = getConvertedValue(pl) >= 0 ? TrendingUp : TrendingDown;
    const IconComponent = icon;

    return (
        <div className="bg-slate-800/70 p-4 sm:p-6 rounded-xl border border-slate-700/80 flex-1 min-w-[200px] shadow-xl hover:shadow-slate-700/60 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
               <p className="text-base font-semibold text-slate-300">{title}</p>
               {IconComponent && <IconComponent className={`h-6 w-6 opacity-70 ${
                    type === 'crypto' ? 'text-orange-400' :
                    type === 'stock' ? 'text-sky-400' :
                    type === 'forex' ? 'text-purple-400' :
                    'text-slate-500'
               }`} />}
            </div>
            {isLoading ? (
                <div className="h-[52px] flex items-center">
                    <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
                </div>
            ) : (
               <>
                 <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{fc(value)}</p>
                 {tagline ? (
                    <p className="text-sm text-slate-400">{tagline}</p>
                 ) : (
                    <p className={`text-sm font-medium ${plColor} flex items-center`}>
                        <PlIcon className="h-4 w-4 mr-1" />
                        {fc(pl)}
                    </p>
                 )}
                </>
            )}
        </div>
    );
};


const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    portfolio, 
    transactions, 
    isLoading: isLoadingPortfolio, 
    isLoadingTransactions,
    isLoadingPrices,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    apiWarnings 
  } = usePortfolio(); 
  const { displayCurrency } = useSettings();

  const totals = {
    crypto: { value: 0, pl: 0, name: "Criptomonedas", icon: Bitcoin, tag: "Tus monedas digitales." },
    stock: { value: 0, pl: 0, name: "Acciones", icon: Activity, tag: "Inversiones en empresas." },
    forex: { value: 0, pl: 0, name: "Divisas", icon: Landmark, tag: "Movimientos en el mercado cambiario." },
    all: { value: 0, pl: 0, name: "Valor Total", icon: Wallet, tag: "Todo tu portafolio combinado."}
  };
  
  const portfolioAssets = portfolio || {};

  Object.values(portfolioAssets).forEach(asset => {
    if (asset && typeof asset.asset_type === 'string') { 
        const type = asset.asset_type;
        if (totals[type]) {
            totals[type].value += asset.currentValue; 
            totals[type].pl += asset.totalPL; 
        } else {
            console.warn(`Unknown asset type encountered in totals calculation: ${type} for asset ${asset.asset_name}`);
            totals.crypto.value += asset.currentValue; 
            totals.crypto.pl += asset.totalPL; 
        }
        totals.all.value += asset.currentValue;
        totals.all.pl += asset.totalPL;
    } else if (asset && typeof asset.asset_name === 'string') { 
        console.warn(`Asset ${asset.asset_name} is missing asset_type. Defaulting to crypto.`);
        totals.crypto.value += asset.currentValue; 
        totals.crypto.pl += asset.totalPL; 
        totals.all.value += asset.currentValue;
        totals.all.pl += asset.totalPL;
    }
  });

  const hasTransactions = transactions && transactions.length > 0;
  const showLoadingState = (isLoadingPrices && hasTransactions) || (isLoadingTransactions && !hasTransactions);

  const renderWelcomeOrLogin = () => {
    if (!user && !isLoadingTransactions && !hasTransactions) {
      return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-10 bg-slate-800/50 rounded-xl border border-slate-700/70 shadow-xl"
        >
            <Wallet className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">Bienvenido a Tu Rastreador de Portafolio</h2>
            <p className="text-slate-300 max-w-md mx-auto mb-6">
                Comienza a seguir tus inversiones de forma sencilla. Añade tu primera transacción o inicia sesión para guardar tu progreso en la nube.
            </p>
            <Button 
                size="lg" 
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white text-lg px-8 py-3"
                onClick={() => navigate('/auth')}
            >
                Iniciar Sesión / Registrarse
            </Button>
        </motion.div>
      );
    }
    return null;
  }

  return (
    <div className="space-y-8 pb-16">
       <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8 pt-4"
        >
          <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                {user ? `Portafolio de ${user.email.split('@')[0]}` : "Tu Portafolio Local"}
              </h1>
              <p className="text-slate-400">
                {user ? `Visualiza tus inversiones en ${displayCurrency}.` : `Tus datos se guardan localmente. Inicia sesión para sincronizar con la nube.`}
              </p>
           </div>
           <div className="w-full sm:w-auto mt-2 sm:mt-0">
             <AddTransactionForm onAddTransaction={addTransaction} />
           </div>
      </motion.div>

       <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
            <StatCard
                title={totals.all.name}
                value={totals.all.value} 
                pl={totals.all.pl} 
                isLoading={showLoadingState}
                icon={totals.all.icon}
                type="all"
                tagline={`Ganancia/Pérdida Total en ${displayCurrency}`}
            />
             <StatCard
                title={totals.crypto.name}
                value={totals.crypto.value}
                pl={totals.crypto.pl}
                isLoading={showLoadingState}
                icon={totals.crypto.icon}
                type="crypto"
                tagline={totals.crypto.tag}
            />
             <StatCard
                title={totals.stock.name}
                value={totals.stock.value}
                pl={totals.stock.pl}
                isLoading={showLoadingState}
                icon={totals.stock.icon}
                type="stock"
                tagline={totals.stock.tag}
            />
             <StatCard
                title={totals.forex.name}
                value={totals.forex.value}
                pl={totals.forex.pl}
                isLoading={showLoadingState}
                icon={totals.forex.icon}
                type="forex"
                tagline={totals.forex.tag}
            />
       </motion.div>
      
      {renderWelcomeOrLogin()}

      {(isLoadingTransactions && !user && transactions.length === 0) && (
           <div className="text-center py-10">
               <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
               <p className="text-slate-400 mt-2">Cargando datos locales...</p>
           </div>
      )}

      {(!hasTransactions && !isLoadingTransactions && !user && transactions.length === 0) && !renderWelcomeOrLogin() && (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-10 bg-slate-800/30 rounded-lg border border-slate-700/50"
          >
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Tu portafolio local está vacío</h3>
            <p className="text-slate-400">Añade tu primera transacción para comenzar.</p>
          </motion.div>
      )}
      
      {(hasTransactions || (user && isLoadingPortfolio)) && (
        <PortfolioTable
            portfolioData={portfolioAssets}
            transactions={transactions}
            isLoadingPrices={isLoadingPrices}
            isLoadingTransactions={isLoadingTransactions}
            onDeleteTransaction={deleteTransaction}
            onUpdateTransaction={updateTransaction}
            apiWarnings={apiWarnings}
        />
      )}
    </div>
  );
};

export default DashboardPage;
