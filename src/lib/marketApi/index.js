
import { fetchCryptoPrices } from './cryptoApi';
import { fetchStockOrForexPricesPolygon, fetchExchangeRatePolygon } from './polygonApi';

export const COINMARKETCAP_API_KEY = '0fdba22a-7e0b-4d46-85aa-d5187fed7798'; // For future use

export const fetchMarketData = async (transactions, polygonApiKey) => {
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
        const cryptoResult = await fetchCryptoPrices([...cryptoAssets]);
        
        const stockForexResult = await fetchStockOrForexPricesPolygon(
            [...stockAssets],
            [...forexAssets],
            polygonApiKey
        );

        overallWarnings = overallWarnings.concat(
            cryptoResult.warnings || [],
            stockForexResult.warnings || []
        );
        
        return {
            prices: { ...(stockForexResult.prices || {}), ...(cryptoResult.prices || {}) },
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
    return fetchExchangeRatePolygon(fromCurrency, toCurrency, apiKey);
};
