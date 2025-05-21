
export const formatCurrency = (value, targetCurrency, getConvertedValueFunc, locale = 'es-ES') => {
  const numericValue = Number(value);

  if (isNaN(numericValue)) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: targetCurrency || 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(0);
  }

  let displayValue;
  if (getConvertedValueFunc && targetCurrency !== 'USD') {
    displayValue = getConvertedValueFunc(numericValue);
  } else {
    displayValue = numericValue; 
  }
  
  const finalCurrency = targetCurrency || 'USD';

  return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: finalCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: (displayValue !== 0 && Math.abs(displayValue) < 1 && Math.abs(displayValue) > 1e-5) ? 5 : 2
  }).format(displayValue);
};

export const formatQuantity = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '0.00';
    
    let maximumFractionDigits = 4;
    if (numericValue !== 0) {
        if (Math.abs(numericValue) < 0.0001) {
            maximumFractionDigits = 8;
        } else if (Math.abs(numericValue) < 0.01) {
            maximumFractionDigits = 6;
        }
    }

    return numericValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: maximumFractionDigits,
    });
};

export const formatPercentage = (value) => {
    const numericValue = Number(value);
    if (isNaN(numericValue)) return '0.00%';
    return `${numericValue.toFixed(2)}%`;
};
