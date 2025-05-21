
import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/formatters';
import { useSettings } from '@/contexts/SettingsContext';

const generateColorForPie = (index) => {
  const colors = [
    '#34D399', 
    '#60A5FA', 
    '#FBBF24', 
    '#F87171', 
    '#A78BFA', 
    '#2DD4BF', 
    '#F472B6', 
    '#A3E635', 
    '#0EA5E9', 
    '#F59E0B', 
  ];
  return colors[index % colors.length];
};

const PortfolioPieChart = ({ data }) => {
  const { displayCurrency, getConvertedValue } = useSettings();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0); // data values are already converted in ChartsPage

  const fc = (value) => formatCurrency(value, displayCurrency, null); // Pass null for getConvertedValue as value is already converted

  if (totalValue === 0 || data.length === 0) {
    return <div className="text-center text-slate-400 py-4">No hay datos para mostrar el gráfico.</div>;
  }

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 30;

  const isSingleFullAsset = data.length === 1 && data[0].value === totalValue;

  return (
    <div className="flex flex-col items-center">
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        initial="hidden"
        animate="visible"
        className="transform " 
      >
         <circle
           cx="100"
           cy="100"
           r={radius}
           fill="transparent"
           stroke="#475569" 
           strokeWidth={strokeWidth}
         />

        {isSingleFullAsset ? (
          <motion.circle
            key={data[0].name}
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={generateColorForPie(0)}
            strokeWidth={strokeWidth}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <title>{`${data[0].name}: ${fc(data[0].value)} (100.0%)`}</title>
          </motion.circle>
        ) : (
          (() => {
             let accumulatedAngle = -90; 
             return data.map((item, index) => {
                const percentage = item.value / totalValue;
                const angleDegrees = percentage * 360;
                const startAngle = accumulatedAngle;
                const endAngle = accumulatedAngle + angleDegrees;
                accumulatedAngle = endAngle; 

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 100 + radius * Math.cos(startRad);
                const y1 = 100 + radius * Math.sin(startRad);
                const x2 = 100 + radius * Math.cos(endRad);
                const y2 = 100 + radius * Math.sin(endRad);
                const largeArcFlag = angleDegrees > 180 ? 1 : 0;

                const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

                const segmentVariants = {
                  hidden: { pathLength: 0, opacity: 0 },
                  visible: {
                    pathLength: 1,
                    opacity: 1,
                    transition: { duration: 0.5, ease: "easeOut", delay: index * 0.05 }
                  }
                };

                return (
                  <motion.path
                    key={item.name}
                    d={pathData}
                    fill="transparent"
                    stroke={generateColorForPie(index)}
                    strokeWidth={strokeWidth}
                    variants={segmentVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <title>{`${item.name}: ${fc(item.value)} (${(percentage * 100).toFixed(1)}%)`}</title>
                  </motion.path>
                );
             });
          })()
        )}
      </motion.svg>

       <div className="mt-6 w-full max-w-md">
         <ul className="space-y-1 text-sm">
           {data.sort((a,b)=> b.value - a.value).slice(0, 8).map((item, index) => ( 
             <li key={item.name} className="flex justify-between items-center text-slate-300">
               <span className="flex items-center">
                 <span className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: generateColorForPie(index) }}></span>
                 <span className="truncate" title={item.name}>{item.name}</span>
               </span>
               <span className="font-medium ml-2">{(item.value / totalValue * 100).toFixed(1)}%</span>
             </li>
           ))}
         </ul>
       </div>
    </div>
  );
};

export default PortfolioPieChart;
