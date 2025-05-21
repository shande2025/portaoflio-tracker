
import React from 'react';
import PortfolioSummaryTable from '@/components/portfolio/PortfolioSummaryTable';
import TransactionHistoryTable from '@/components/portfolio/TransactionHistoryTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const PortfolioTable = ({ 
  portfolioData, 
  transactions, 
  isLoadingPrices, 
  isLoadingTransactions,
  onDeleteTransaction, 
  onUpdateTransaction,
  apiWarnings 
}) => {

  if (isLoadingTransactions && (!transactions || transactions.length === 0) ) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center py-10 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg text-slate-300">Cargando tus transacciones...</p>
        </div>
    );
  }
  
  if (!isLoadingTransactions && (!transactions || transactions.length === 0)) {
    return null; // No mostrar nada si no hay transacciones y no está cargando (DashboardPage maneja el mensaje de "vacío")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 p-1 h-auto mb-4">
          <TabsTrigger value="summary" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            Resumen del Portafolio
          </TabsTrigger>
          <TabsTrigger value="history" className="py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
            Historial de Transacciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <PortfolioSummaryTable 
            portfolioData={portfolioData} 
            isLoadingPrices={isLoadingPrices || isLoadingTransactions} 
            apiWarnings={apiWarnings}
          />
        </TabsContent>
        <TabsContent value="history">
          <TransactionHistoryTable 
            transactions={transactions} 
            onDeleteTransaction={onDeleteTransaction}
            onUpdateTransaction={onUpdateTransaction}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default PortfolioTable;
