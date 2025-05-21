
const ALPHA_VANTAGE_REQUEST_DELAY = 1200; // ms

const makeAlphaVantageRequest = async (url, symbolForWarning) => {
    const warnings = [];
    try {
        await new Promise(resolve => setTimeout(resolve, ALPHA_VANTAGE_REQUEST_DELAY));
        const response = await fetch(url);
        if (!response.ok) {
            const msg = `Error API Alpha Vantage para ${symbolForWarning}: ${response.status} ${response.statusText}`;
            console.error(msg);
            warnings.push(msg);
            return { data: null, warnings };
        }
        const data = await response.json();
        if (data['Note']) {
            const msg = `Límite API Alpha Vantage alcanzado o nota para ${symbolForWarning}: ${data['Note']}`;
            console.warn(msg);
            warnings.push(msg);
            return { data: null, warnings, limitReached: true }; 
        }
        return { data, warnings };
    } catch (error) {
        const msg = `Fallo al obtener datos de Alpha Vantage para ${symbolForWarning}: ${error.message}`;
        console.error(msg, error);
        warnings.push(msg);
        return { data: null, warnings };
    }
};

export const fetchStockPricesAlphaVantage = async (stockSymbols, apiKey) => {
    let cumulativeWarnings = [];
    if (!stockSymbols || stockSymbols.length === 0) {
        return { prices: {}, warnings: cumulativeWarnings };
    }
    if (!apiKey) {
        const msg = "Clave API de Alpha Vantage no proporcionada para obtener precios de acciones.";
        console.warn(msg);
        cumulativeWarnings.push(msg);
        return { prices: {}, warnings: cumulativeWarnings };
    }
    
    const prices = {};
    for (const symbol of stockSymbols) {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
        const { data, warnings, limitReached } = await makeAlphaVantageRequest(url, symbol);
        cumulativeWarnings = cumulativeWarnings.concat(warnings);

        if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
            prices[symbol] = parseFloat(data['Global Quote']['05. price']);
        } else if (!limitReached) {
            const msg = `Precio no encontrado en Alpha Vantage para: ${symbol}. Respuesta: ${data ? JSON.stringify(data) : 'No response data'}`;
            console.warn(msg);
            cumulativeWarnings.push(msg);
        }
        if (limitReached) break; 
    }
    return { prices, warnings: cumulativeWarnings };
};

export const fetchForexPricesAlphaVantage = async (forexPairs, apiKey) => {
    let cumulativeWarnings = [];
    if (!forexPairs || forexPairs.length === 0) {
        return { prices: {}, warnings: cumulativeWarnings };
    }
    if (!apiKey) {
        const msg = "Clave API de Alpha Vantage no proporcionada para obtener precios de divisas.";
        console.warn(msg);
        cumulativeWarnings.push(msg);
        return { prices: {}, warnings: cumulativeWarnings };
    }
    
    const prices = {};
    for (const pair of forexPairs) {
        if (pair.length !== 6) { 
            const msg = `Formato de par de divisas inválido: ${pair}. Se esperan 6 caracteres como EURUSD.`;
            console.warn(msg);
            cumulativeWarnings.push(msg);
            continue;
        }
        const fromCurrency = pair.substring(0, 3);
        const toCurrency = pair.substring(3, 6);
        const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${apiKey}`;
        
        const { data, warnings, limitReached } = await makeAlphaVantageRequest(url, pair);
        cumulativeWarnings = cumulativeWarnings.concat(warnings);

        if (data && data['Realtime Currency Exchange Rate'] && data['Realtime Currency Exchange Rate']['5. Exchange Rate']) {
            prices[pair] = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        } else if (!limitReached) {
            const msg = `Tipo de cambio no encontrado en Alpha Vantage para: ${pair}. Respuesta: ${data ? JSON.stringify(data) : 'No response data'}`;
            console.warn(msg);
            cumulativeWarnings.push(msg);
        }
        if (limitReached) break;
    }
    return { prices, warnings: cumulativeWarnings };
};

export const fetchExchangeRateAlphaVantage = async (fromCurrency, toCurrency, apiKey) => {
    let cumulativeWarnings = [];
    if (!fromCurrency || !toCurrency) {
        const msg = "Parámetros faltantes para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
     if (!apiKey) {
        const msg = "Clave API de Alpha Vantage no proporcionada para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
    if (fromCurrency === toCurrency) return { rate: 1.0, warnings: [] };

    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fromCurrency}&to_currency=${toCurrency}&apikey=${apiKey}`;
    const { data, warnings, limitReached } = await makeAlphaVantageRequest(url, `${fromCurrency} a ${toCurrency}`);
    cumulativeWarnings = cumulativeWarnings.concat(warnings);

    if (data && data['Realtime Currency Exchange Rate'] && data['Realtime Currency Exchange Rate']['5. Exchange Rate']) {
        return { rate: parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']), warnings: cumulativeWarnings };
    } else if (!limitReached) {
        const msg = `Tipo de cambio no encontrado en Alpha Vantage para: ${fromCurrency} a ${toCurrency}. Respuesta: ${data ? JSON.stringify(data) : 'No response data'}`;
        console.warn(msg);
        cumulativeWarnings.push(msg);
    }
    return { rate: null, warnings: cumulativeWarnings };
};
