
import { fetchCryptoPrices } from './marketApi/cryptoApi';
import { fetchStockPricesAlphaVantage, fetchForexPricesAlphaVantage, fetchExchangeRateAlphaVantage } from './marketApi/alphaVantageApi';

export const COINMARKETCAP_API_KEY = '0fdba22a-7e0b-4d46-85aa-d5187fed7798'; // For future use

export const fetchMarketData = async (transactions, alphaVantageApiKey) => {
    if (!transactions || transactions.length === 0) {
        return { prices: {}, warnings: [] };
    }

    const cryptoAssets = new Set();
    const stockAssets = new Set();
    const forexAssets = new Set();
    let overallWarnings = [];

    transactions.forEach(tx => {
        const name = tx.asset_name.toUpperCase(); 
        switch (tx.asset_type) { 
            case 'crypto':
                cryptoAssets.add(name);
                break;
            case 'stock':
                stockAssets.add(name);
                break;
            case 'forex':
                forexAssets.add(name);
                break;
            default:
                 cryptoAssets.add(name);
                 const warnMsg = `Tipo de activo desconocido o faltante para ${name}, tratando como crypto.`;
                 console.warn(warnMsg);
                 overallWarnings.push(warnMsg);
        }
    });

    try {
        const [cryptoResult, stockResult, forexResult] = await Promise.all([
            fetchCryptoPrices([...cryptoAssets]),
            fetchStockPricesAlphaVantage([...stockAssets], alphaVantageApiKey),
            fetchForexPricesAlphaVantage([...forexAssets], alphaVantageApiKey)
        ]);
        
        overallWarnings = overallWarnings.concat(
            cryptoResult.warnings || [], 
            stockResult.warnings || [], 
            forexResult.warnings || []
        );
        
        return { 
            prices: { ...(forexResult.prices || {}), ...(stockResult.prices || {}), ...(cryptoResult.prices || {}) },
            warnings: overallWarnings 
        };
    } catch (error) {
        const errorMsg = `Error al obtener datos de mercado: ${error.message}`;
        console.error(errorMsg, error);
        overallWarnings.push(errorMsg);
        return { prices: {}, warnings: overallWarnings };
    }
};

export const fetchExchangeRate = async (fromCurrency, toCurrency, apiKey) => {
    return fetchExchangeRateAlphaVantage(fromCurrency, toCurrency, apiKey);
};
