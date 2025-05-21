
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { useSettings } from '@/contexts/SettingsContext';
import { TrendingUp, TrendingDown, AlertTriangle, Info, Activity, Bitcoin, Landmark } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const PortfolioSummaryTable = ({ portfolioData, isLoadingPrices, apiWarnings }) => {
  const { displayCurrency, getConvertedValue } = useSettings();
  const fc = (val) => formatCurrency(val, displayCurrency, getConvertedValue);
  const fp = (val) => formatPercentage(val);

  const sortedAssets = Object.values(portfolioData || {})
    .filter(asset => asset && typeof asset.asset_name === 'string') 
    .sort((a, b) => getConvertedValue(b.currentValue) - getConvertedValue(a.currentValue));

  const getAssetApiWarning = (assetName) => {
    if (!apiWarnings || apiWarnings.length === 0) return null;
    const upperAssetName = assetName.toUpperCase();
    const warning = apiWarnings.find(w => w && w.toUpperCase().includes(upperAssetName));
    return warning;
  };

  const getAssetIcon = (assetType) => {
    if (assetType === 'crypto') return <Bitcoin className="h-5 w-5 text-orange-400 mr-2 inline-block" />;
    if (assetType === 'stock') return <Activity className="h-5 w-5 text-sky-400 mr-2 inline-block" />;
    if (assetType === 'forex') return <Landmark className="h-5 w-5 text-purple-400 mr-2 inline-block" />;
    return null;
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="overflow-x-auto bg-slate-800/60 backdrop-blur-md rounded-lg shadow-xl border border-slate-700"
    >
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700 hover:bg-slate-700/30">
            <TableHead className="text-slate-300 font-semibold">Activo</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Tienes</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Precio Actual ({displayCurrency})</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Valor ({displayCurrency})</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Invertido ({displayCurrency})</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Ganancia/Pérdida ({displayCurrency})</TableHead>
            <TableHead className="text-right text-slate-300 font-semibold">Ganancia/Pérdida (%)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoadingPrices && sortedAssets.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                Calculando el valor de tu portafolio...
              </TableCell>
            </TableRow>
          )}
          {!isLoadingPrices && sortedAssets.length === 0 && (
             <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                No hay activos en el portafolio para mostrar. ¡Añade una transacción!
              </TableCell>
            </TableRow>
          )}
          {sortedAssets.map((asset) => {
            const pl = asset.totalPL || 0;
            const plPercentage = asset.totalPLPercentage || 0;
            const isPositive = getConvertedValue(pl) >= 0;
            const plColor = isPositive ? 'text-green-400' : 'text-red-400';
            const TrendIcon = isPositive ? TrendingUp : TrendingDown;
            const assetWarning = getAssetApiWarning(asset.asset_name);
            const AssetIcon = getAssetIcon(asset.asset_type);

            return (
              <TableRow key={asset.asset_name} className="border-slate-700 hover:bg-slate-700/50 transition-colors">
                <TableCell className="font-medium text-sky-300 flex items-center">
                  {AssetIcon}
                  <span className="font-bold">{asset.asset_name}</span>
                  {asset.isFallbackPrice && (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger className="ml-2 cursor-help">
                           <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border-slate-700">
                          <p>Precio actual no disponible.</p>
                          <p>Usando precio promedio de compra.</p>
                          {assetWarning && <p className="text-xs mt-1 text-amber-300">Info: {assetWarning.length > 100 ? assetWarning.substring(0,97) + "..." : assetWarning}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                   {!asset.isFallbackPrice && assetWarning && (
                     <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger className="ml-2 cursor-help">
                           <Info className="h-4 w-4 text-blue-400" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-white border-slate-700 max-w-xs">
                          <p className="text-xs text-sky-300">Nota API: {assetWarning.length > 150 ? assetWarning.substring(0,147) + "..." : assetWarning}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                   )}
                </TableCell>
                <TableCell className="text-right text-slate-300">{asset.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: asset.asset_type === 'crypto' ? 8 : 2 })}</TableCell>
                <TableCell className="text-right text-slate-300">
                  {asset.currentPrice ? fc(asset.currentPrice) : <span className="text-slate-500">-</span>}
                </TableCell>
                <TableCell className="text-right font-semibold text-white">{fc(asset.currentValue)}</TableCell>
                <TableCell className="text-right text-slate-400">{fc(asset.totalCost)}</TableCell>
                <TableCell className={`text-right font-medium ${plColor} flex items-center justify-end`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  {fc(pl)}
                </TableCell>
                <TableCell className={`text-right font-medium ${plColor}`}>
                  {fp(plPercentage)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default PortfolioSummaryTable;
