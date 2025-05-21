
const FMP_REQUEST_DELAY = 200; // ms, FMP is generally more permissive with free tier

const makeFMPRequest = async (url, symbolForWarning) => {
    const warnings = [];
    try {
        await new Promise(resolve => setTimeout(resolve, FMP_REQUEST_DELAY));
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData['Error Message'] || errorData.message || `Error API FMP para ${symbolForWarning}: ${response.status} ${response.statusText}`;
            console.error(errorMsg);
            warnings.push(errorMsg);
            return { data: null, warnings };
        }
        const data = await response.json();
        if (Array.isArray(data) && data.length === 0) {
             const msg = `No se encontraron datos en FMP para: ${symbolForWarning}. La respuesta estuvo vacía.`;
             console.warn(msg);
             warnings.push(msg);
             return { data: null, warnings };
        }
        if (data['Error Message']) {
            const msg = `Error de API FMP para ${symbolForWarning}: ${data['Error Message']}`;
            console.warn(msg);
            warnings.push(msg);
            return { data: null, warnings };
        }
        return { data, warnings };
    } catch (error) {
        const msg = `Fallo al obtener datos de FMP para ${symbolForWarning}: ${error.message}`;
        console.error(msg, error);
        warnings.push(msg);
        return { data: null, warnings };
    }
};

export const fetchStockOrForexPricesFMP = async (symbols, apiKey) => {
    let cumulativeWarnings = [];
    if (!symbols || symbols.length === 0) {
        return { prices: {}, warnings: cumulativeWarnings };
    }
    if (!apiKey) {
        const msg = "Clave API de FMP no proporcionada para obtener precios.";
        console.warn(msg);
        cumulativeWarnings.push(msg);
        return { prices: {}, warnings: cumulativeWarnings };
    }

    const prices = {};
    const batchSize = 100; 
    for (let i = 0; i < symbols.length; i += batchSize) {
        const batchSymbols = symbols.slice(i, i + batchSize);
        const symbolsQueryParam = batchSymbols.join(',');
        
        const stockUrl = `https://financialmodelingprep.com/api/v3/quote/${symbolsQueryParam}?apikey=${apiKey}`;
        const forexUrl = `https://financialmodelingprep.com/api/v3/fx/${symbolsQueryParam}?apikey=${apiKey}`;

        const [stockResponse, forexResponse] = await Promise.all([
            makeFMPRequest(stockUrl, `lote de acciones ${i / batchSize + 1}`),
            makeFMPRequest(forexUrl, `lote de forex ${i / batchSize + 1}`)
        ]);
        
        cumulativeWarnings = cumulativeWarnings.concat(stockResponse.warnings || [], forexResponse.warnings || []);

        if (stockResponse.data && Array.isArray(stockResponse.data)) {
            stockResponse.data.forEach(item => {
                if (item && item.symbol && typeof item.price === 'number') {
                    prices[item.symbol.toUpperCase()] = item.price;
                }
            });
        }

        if (forexResponse.data && Array.isArray(forexResponse.data)) {
            forexResponse.data.forEach(item => {
                if (item && item.ticker && typeof item.bid === 'number') {
                    prices[item.ticker.replace('/', '').toUpperCase()] = item.bid; 
                }
            });
        }
    }
    
    symbols.forEach(symbol => {
        if (prices[symbol.toUpperCase()] === undefined) {
            const msg = `Precio no encontrado en FMP para: ${symbol}.`;
            if (!cumulativeWarnings.some(w => w.includes(symbol))) {
                 console.warn(msg);
                 cumulativeWarnings.push(msg);
            }
        }
    });

    return { prices, warnings: cumulativeWarnings };
};


export const fetchExchangeRateFMP = async (fromCurrency, toCurrency, apiKey) => {
    let cumulativeWarnings = [];
    if (!fromCurrency || !toCurrency) {
        const msg = "Parámetros faltantes para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
    if (!apiKey) {
        const msg = "Clave API de FMP no proporcionada para obtener tipo de cambio.";
        console.warn(msg);
        return { rate: null, warnings: [msg] };
    }
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) return { rate: 1.0, warnings: [] };

    const symbol = `${fromCurrency.toUpperCase()}${toCurrency.toUpperCase()}`;
    const url = `https://financialmodelingprep.com/api/v3/fx/${symbol}?apikey=${apiKey}`;
    
    const { data, warnings } = await makeFMPRequest(url, `${fromCurrency} a ${toCurrency}`);
    cumulativeWarnings = cumulativeWarnings.concat(warnings);

    if (data && Array.isArray(data) && data.length > 0 && data[0].bid) {
        return { rate: parseFloat(data[0].bid), warnings: cumulativeWarnings };
    } else if (data && data['Error Message']) {
         const msg = `Error API FMP para ${symbol}: ${data['Error Message']}`;
         if (!cumulativeWarnings.some(w => w.includes(symbol))) {
            console.warn(msg);
            cumulativeWarnings.push(msg);
         }
    } else {
        const msg = `Tipo de cambio no encontrado en FMP para: ${fromCurrency} a ${toCurrency}.`;
        if (!cumulativeWarnings.some(w => w.includes(symbol))) {
            console.warn(msg);
            cumulativeWarnings.push(msg);
        }
    }
    return { rate: null, warnings: cumulativeWarnings };
};
