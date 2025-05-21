
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatters';
import { useSettings } from '@/contexts/SettingsContext';
import { Bitcoin, TrendingUp, Landmark } from 'lucide-react';
import { cn } from "@/lib/utils";

const AssetTypeIcon = ({ type, className }) => {
    if (type === 'crypto') return <Bitcoin className={cn("h-4 w-4 text-orange-400", className)} />;
    if (type === 'stock') return <TrendingUp className={cn("h-4 w-4 text-blue-400", className)} />;
    if (type === 'forex') return <Landmark className={cn("h-4 w-4 text-purple-400", className)} />;
    return null;
};

const generateColorForChart = (index, type) => {
  const cryptoColors = ['#F7931A', '#F0B90B', '#E8A60C', '#DFAA11', '#D6AD16'];
  const stockColors = ['#3B82F6', '#60A5FA', '#2563EB', '#1D4ED8', '#1E3A8A'];
  const forexColors = ['#8B5CF6', '#A78BFA', '#7C3AED', '#6D28D9', '#5B21B6'];
  
  switch (type) {
    case 'crypto':
      return cryptoColors[index % cryptoColors.length];
    case 'stock':
      return stockColors[index % stockColors.length];
    case 'forex':
      return forexColors[index % forexColors.length];
    default:
      const generalColors = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#6366F1'];
      return generalColors[index % generalColors.length];
  }
};

const AssetValueBarChart = ({ data }) => {
  const { displayCurrency, getConvertedValue } = useSettings();

  // data values are already converted in ChartsPage before being passed here
  const fc = (value) => formatCurrency(value, displayCurrency, null); // Pass null for getConvertedValue

  if (!data || data.length === 0) {
    return <p className="text-slate-400 text-center py-8">No hay datos para mostrar el gráfico de barras.</p>;
  }

  const maxValue = Math.max(...data.map(item => item.value)); 
  const barHeight = 30;
  const barGap = 10;
  const chartHeight = (barHeight + barGap) * data.length - barGap;

  return (
    <div className="w-full text-slate-300">
      <motion.svg 
        width="100%" 
        height={chartHeight}
        initial="initial"
        animate="animate"
      >
        {data.map((item, index) => {
          const y = index * (barHeight + barGap);
          const barWidth = item.value > 0 ? (item.value / maxValue) * 100 : 0;
          const color = generateColorForChart(index, item.type);

          return (
            <g key={item.name}>
              <motion.rect
                x="0"
                y={y}
                width={`${barWidth}%`}
                height={barHeight}
                fill={color}
                rx="3"
                ry="3"
                variants={{
                  initial: { width: 0, opacity: 0 },
                  animate: { width: `${barWidth}%`, opacity: 1, transition: { duration: 0.5, delay: index * 0.05 } }
                }}
              />
              <text x="5" y={y + barHeight / 2 + 5} fontSize="12" fill="white" className="font-medium">
                <AssetTypeIcon type={item.type} className="inline-block mr-1 -mt-0.5" />
                {item.name}
              </text>
              <text x={`${barWidth > 15 ? barWidth - 1 : barWidth + 1}%`} y={y + barHeight / 2 + 5} fontSize="12" fill="white" textAnchor={`${barWidth > 15 ? 'end' : 'start'}`} className="font-semibold">
                {fc(item.value)}
              </text>
            </g>
          );
        })}
      </motion.svg>
    </div>
  );
};

export default AssetValueBarChart;
