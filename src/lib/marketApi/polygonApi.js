
const POLYGON_REQUEST_DELAY = 200; // ms. Polygon free tier allows 5 requests/minute.

const makePolygonRequest = async (url, symbolForWarning) => {
    const warnings = [];
    try {
        await new Promise(resolve => setTimeout(resolve, POLYGON_REQUEST_DELAY));
        const response = await fetch(url);
        
        if (!response.ok) {
            let errorMsg = `Error API Polygon.io para ${symbolForWarning}: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.message) {
                    errorMsg += ` - ${errorData.message}`;
                } else if (errorData && errorData.error) {
                     errorMsg += ` - ${errorData.error}`;
                }
            } catch (e) { /* ignore if parsing error body fails */ }
            console.error(errorMsg);
            warnings.push(errorMsg);
            if (response.status === 429) { // Too Many Requests
                 warnings.push(`Límite de solicitudes de Polygon.io alcanzado para ${symbolForWarning}. Intenta de nuevo más tarde.`);
            }
            return { data: null, warnings };
        }
        
        const data = await response.json();

        if (data.status === 'ERROR' || data.resultsCount === 0 || (Array.isArray(data.results) && data.results.length === 0)) {
             let msg = `No se encontraron datos en Polygon.io para: ${symbolForWarning}.`;
             if(data.message) msg += ` Mensaje: ${data.message}`;
             console.warn(msg);
             warnings.push(msg);
             return { data: null, warnings };
        }
        return { data, warnings };
    } catch (error) {
        const msg = `Fallo al obtener datos de Polygon.io para ${symbolForWarning}: ${error.message}`;
        console.error(msg, error);
        warnings.push(msg);
        return { data: null, warnings };
    }
};

export const fetchStockOrForexPricesPolygon = async (stockSymbols, forexPairs, apiKey) => {
    let cumulativeWarnings = [];
    const prices = {};

    if (!apiKey) {
        const msg = "Clave API de Polygon.io no proporcionada para obtener precios.";
        console.warn(msg);
        cumulativeWarnings.push(msg);
        return { prices, warnings: cumulativeWarnings };
    }

    const processResponse = (data, type) => {
        if (!data) return;
        
        if (type === 'stock' && data.results && data.results.length > 0) {
            const tickerData = data.results[0];
            // Prefer 'c' (close), then 'o' (open) if market is closed
            const price = typeof tickerData.c === 'number' ? tickerData.c : 
                          typeof tickerData.o === 'number' ? tickerData.o : null;
            if (price !== null) {
                prices[data.ticker.toUpperCase()] = price;
            } else {
                const msg = `Precio no disponible en los datos de Polygon.io para la acción: ${data.ticker}.`;
                console.warn(msg);
                cumulativeWarnings.push(msg);
            }
        } else if (type === 'forex' && data.results && data.results.length > 0) {
            const forexData = data.results[0];
             // Prefer 'c' (close), then 'o' (open)
            const rate = typeof forexData.c === 'number' ? forexData.c :
                         typeof forexData.o === 'number' ? forexData.o : null;
            if (rate !== null) {
                 prices[data.ticker.substring(2).toUpperCase()] = rate; // Polygon uses C:EURUSD, so we extract EURUSD
            } else {
                const msg = `Tipo de cambio no disponible en los datos de Polygon.io para divisas: ${data.ticker}.`;
                console.warn(msg);
                cumulativeWarnings.push(msg);
            }
        }
    };
    
    for (const symbol of stockSymbols) {
        const url = `https://api.polygon.io/v2/aggs/ticker/${symbol.toUpperCase()}/prev?adjusted=true&apiKey=${apiKey}`;
        const { data: stockData, warnings: stockWarnings } = await makePolygonRequest(url, symbol);
        cumulativeWarnings = cumulativeWarnings.concat(stockWarnings);
        if (stockData) processResponse(stockData, 'stock');
    }

    for (const pair of forexPairs) {
        const formattedPair = `C:${pair.toUpperCase()}`; // Polygon.io format for forex
        const url = `https://api.polygon.io/v2/aggs/ticker/${formattedPair}/prev?adjusted=true&apiKey=${apiKey}`;
        const { data: forexData, warnings: forexWarnings } = await makePolygonRequest(url, pair);
        cumulativeWarnings = cumulativeWarnings.concat(forexWarnings);
        if (forexData) processResponse(forexData, 'forex');
    }
    
    [...stockSymbols, ...forexPairs].forEach(symbol => {
        if (prices[symbol.toUpperCase()] === undefined) {
            const msg = `Precio final no encontrado en Polygon.io para: ${symbol}. Puede que el mercado esté cerrado o el símbolo sea incorrecto.`;
            if (!cumulativeWarnings.some(w => w.includes(symbol) && w.includes("Precio final no encontrado"))) {
                 console.warn(msg);
                 cumulativeWarnings.push(msg);
            }
        }
    });

    return { prices, warnings: cumulativeWarnings };
};

export const fetchExchangeRatePolygon = async (fromCurrency, toCurrency, apiKey) => {
    let cumulativeWarnings = [];
    if (!fromCurrency || !toCurrency) {
        const msg = "Parámetros faltantes para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
    if (!apiKey) {
        const msg = "Clave API de Polygon.io no proporcionada para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return { rate: 1.0, warnings: [] };

    const symbol = `C:${fromCurrency.toUpperCase()}${toCurrency.toUpperCase()}`;
    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
    
    const { data, warnings } = await makePolygonRequest(url, `${fromCurrency} a ${toCurrency}`);
    cumulativeWarnings = cumulativeWarnings.concat(warnings);

    if (data && data.results && data.results.length > 0) {
        const tickerData = data.results[0];
        const rate = typeof tickerData.c === 'number' ? tickerData.c : 
                     typeof tickerData.o === 'number' ? tickerData.o : null;
        if (rate !== null) {
            return { rate, warnings: cumulativeWarnings };
        }
    }
    
    const msg = `Tipo de cambio no encontrado en Polygon.io para: ${fromCurrency} a ${toCurrency}. Puede que el mercado esté cerrado o el par sea incorrecto.`;
     if (!cumulativeWarnings.some(w => w.includes(symbol) && w.includes("Tipo de cambio no encontrado"))) {
        console.warn(msg);
        cumulativeWarnings.push(msg);
    }
    return { rate: null, warnings: cumulativeWarnings };
};
