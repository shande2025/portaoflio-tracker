
import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchExchangeRate as fetchRate } from '@/lib/marketApi';
import { useToast } from "@/components/ui/use-toast";

const ALPHA_VANTAGE_API_KEY = '2FXPKIGHTYK2IPQY';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [displayCurrency, setDisplayCurrency] = useState(localStorage.getItem('displayCurrency') || 'USD');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1.0 });
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('displayCurrency', displayCurrency);
    if (displayCurrency !== 'USD' && !exchangeRates[displayCurrency]) {
      fetchAndSetExchangeRate(displayCurrency);
    }
  }, [displayCurrency]);

  const fetchAndSetExchangeRate = async (currency) => {
    if (currency === 'USD') {
        setExchangeRates(prev => ({ ...prev, USD: 1.0 }));
        return;
    }
    setIsLoadingRates(true);
    try {
      const rate = await fetchRate('USD', currency, ALPHA_VANTAGE_API_KEY);
      if (rate) {
        setExchangeRates(prev => ({ ...prev, [currency]: rate }));
        toast({ title: "Moneda Actualizada", description: `Mostrando valores en ${currency}.` });
      } else {
        toast({ title: "Error de Tasa de Cambio", description: `No se pudo obtener la tasa para ${currency}. Se usará USD.`, variant: "destructive" });
        setDisplayCurrency('USD'); // Fallback to USD
      }
    } catch (error) {
      console.error(`Error fetching exchange rate for ${currency}:`, error);
      toast({ title: "Error de Red", description: `Problema al obtener tasa para ${currency}.`, variant: "destructive" });
      setDisplayCurrency('USD'); // Fallback to USD
    } finally {
      setIsLoadingRates(false);
    }
  };

  const changeDisplayCurrency = (newCurrency) => {
    if (newCurrency !== displayCurrency) {
      setDisplayCurrency(newCurrency);
      if (newCurrency !== 'USD' && !exchangeRates[newCurrency]) {
        fetchAndSetExchangeRate(newCurrency);
      } else if (newCurrency === 'USD') {
         setExchangeRates(prev => ({ ...prev, USD: 1.0 }));
      }
    }
  };

  const getConvertedValue = (valueInUsd) => {
    const rate = exchangeRates[displayCurrency] || 1.0; // Fallback to 1.0 if rate not found
    return valueInUsd * rate;
  };

  return (
    <SettingsContext.Provider value={{ displayCurrency, changeDisplayCurrency, exchangeRates, isLoadingRates, getConvertedValue }}>
      {children}
    </SettingsContext.Provider>
  );
};
