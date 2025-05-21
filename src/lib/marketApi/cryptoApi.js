
export const fetchCryptoPrices = async (cryptoSymbols) => {
    if (!cryptoSymbols || cryptoSymbols.length === 0) {
        return { prices: {}, warnings: [] };
    }

    const binanceSymbols = cryptoSymbols
        .filter(name => name && typeof name === 'string' && name.toUpperCase() !== 'USDT')
        .map(name => `${name.toUpperCase().trim()}USDT`);

    const prices = {};
    const warnings = [];
    if (cryptoSymbols.includes('USDT')) {
        prices['USDT'] = 1.00;
    }

    if (binanceSymbols.length === 0) {
        return { prices, warnings };
    }

    const url = `https://api.binance.com/api/v3/ticker/price?symbols=${JSON.stringify(binanceSymbols)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorBody = await response.text();
            const warningMsg = `Binance API error: ${response.status} ${response.statusText}. ${errorBody}`;
            console.error(warningMsg);
            warnings.push(warningMsg);
            return { prices, warnings };
        }

        const data = await response.json();
        data.forEach(item => {
            const assetName = item.symbol.replace('USDT', '');
            prices[assetName] = parseFloat(item.price);
        });
        
        cryptoSymbols.filter(name => name !== 'USDT').forEach(name => {
            if (prices[name] === undefined) {
                 const warningMsg = `Precio no encontrado en Binance para: ${name}USDT`;
                 console.warn(warningMsg);
                 warnings.push(warningMsg);
            }
        });
        return { prices, warnings };
    } catch (error) {
        const errorMsg = `Fallo al obtener o procesar precios de Binance: ${error.message}`;
        console.error(errorMsg, error);
        warnings.push(errorMsg);
        return { prices, warnings };
    }
};
