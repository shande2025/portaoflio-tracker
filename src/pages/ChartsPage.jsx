
import React from 'react';
import usePortfolio from '@/hooks/usePortfolio';
import { useAuth } from '@/contexts/AuthContext';
import PortfolioPieChart from '@/components/charts/PortfolioPieChart';
import AssetValueBarChart from '@/components/charts/AssetValueBarChart';
import { Loader2, PieChart, BarChartHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/contexts/SettingsContext';

const ChartsPage = () => {
  const { user } = useAuth();
  const { portfolio, isLoading, apiWarnings } = usePortfolio(user?.id);
  const { getConvertedValue } = useSettings();

  const portfolioAssets = portfolio || {};

  const chartData = Object.values(portfolioAssets)
    .filter(asset => asset && asset.currentValue > 0)
    .map(asset => ({
      name: asset.asset_name, 
      value: getConvertedValue(asset.currentValue), 
      type: asset.asset_type 
    }))
    .sort((a, b) => b.value - a.value);

  const pieChartData = chartData.slice(0, 10); 
  const barChartData = chartData.slice(0, 15); 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
      </div>
    );
  }

  const hasData = chartData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-12 pb-16"
    >
      <div>
        <div className="flex items-center mb-6">
          <PieChart className="h-8 w-8 text-pink-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Distribución del Portafolio</h1>
        </div>
        {apiWarnings && apiWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-300 text-xs">
            <p className="font-semibold mb-1">Advertencias de API:</p>
            <ul className="list-disc list-inside">
              {apiWarnings.slice(0,3).map((warning, index) => (
                <li key={index} className="truncate" title={warning}>{warning.length > 100 ? warning.substring(0,97) + "..." : warning}</li>
              ))}
              {apiWarnings.length > 3 && <li>Y {apiWarnings.length - 3} más...</li>}
            </ul>
          </div>
        )}
        {hasData ? (
          <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <PortfolioPieChart data={pieChartData} />
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700/50">
            No hay datos suficientes en el portafolio para mostrar el gráfico de distribución.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center mb-6">
          <BarChartHorizontal className="h-8 w-8 text-teal-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Valor de Activos Individuales</h1>
        </div>
        {hasData ? (
          <div className="p-6 bg-slate-800/50 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700">
            <AssetValueBarChart data={barChartData} />
          </div>
        ) : (
           <p className="text-slate-400 text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700/50">
            No hay datos suficientes en el portafolio para mostrar el gráfico de valor de activos.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ChartsPage;
