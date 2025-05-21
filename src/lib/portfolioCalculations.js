
export const calculatePortfolioSummary = (transactions, prices) => {
  const portfolio = {};

  transactions.forEach(tx => {
    const { asset_name, asset_type, transaction_type, quantity, price, fees, date } = tx;
    const amount = parseFloat(quantity);
    const unitPrice = parseFloat(price);
    const transactionFees = parseFloat(fees) || 0;
    const costOrProceeds = unitPrice * amount;

    if (!portfolio[asset_name]) {
      portfolio[asset_name] = {
        asset_name: asset_name,
        asset_type: asset_type || 'crypto', 
        quantity: 0,
        totalCostBasis: 0, 
        totalInvested: 0, 
        realizedPL: 0,
        transactions: [], 
        averageBuyPrice: 0,
        currentPrice: 0,
        currentValue: 0,
        unrealizedPL: 0,
        totalPL: 0,
        totalPLPercentage: 0,
        priceSource: 'api',
        isFallbackPrice: false,
      };
    }

    const asset = portfolio[asset_name];
    if (asset.asset_type !== asset_type && asset_type) {
        asset.asset_type = asset_type;
    }
    asset.transactions.push({ ...tx, date: new Date(date) }); 

    if (transaction_type === 'buy') {
      asset.quantity += amount;
      asset.totalInvested += costOrProceeds + transactionFees;
      asset.totalCostBasis += costOrProceeds + transactionFees;
    } else if (transaction_type === 'sell') {
      const saleValue = costOrProceeds - transactionFees;
      let costOfSoldAssets = 0;

      if (asset.quantity > 0) { 
        const averageCostPerUnitBeforeSale = asset.totalCostBasis / asset.quantity;
        costOfSoldAssets = averageCostPerUnitBeforeSale * Math.min(amount, asset.quantity);
      } else {
         costOfSoldAssets = 0;
      }
      
      asset.realizedPL += saleValue - costOfSoldAssets;
      asset.quantity -= amount;
      asset.totalCostBasis -= costOfSoldAssets;

      if (asset.quantity < 1e-9) { 
        asset.quantity = 0;
        asset.totalCostBasis = 0; 
      }
    }
  });

  Object.values(portfolio).forEach(asset => {
    if (asset.quantity > 1e-9) {
      asset.averageBuyPrice = asset.totalCostBasis / asset.quantity;
    } else {
      asset.averageBuyPrice = 0;
      asset.totalCostBasis = 0; 
    }

    const fetchedPrice = prices[asset.asset_name.toUpperCase()];
    let priceToUse;
    asset.isFallbackPrice = false; 

    if (asset.asset_type === 'crypto' && asset.asset_name.toUpperCase() === 'USDT') {
        priceToUse = 1.00;
    } else if (fetchedPrice !== undefined && fetchedPrice > 0) {
        priceToUse = fetchedPrice;
    } else {
        priceToUse = asset.averageBuyPrice > 0 ? asset.averageBuyPrice : 0;
        asset.isFallbackPrice = true;
        if (asset.asset_name.toUpperCase() !== 'USDT' && asset.quantity > 0) {
            console.warn(`Using fallback price for ${asset.asset_name}`);
        }
    }

    asset.currentPrice = priceToUse;
    
    if (asset.quantity > 1e-9) {
        asset.currentValue = asset.quantity * asset.currentPrice;
        asset.unrealizedPL = asset.currentValue - asset.totalCostBasis;
    } else {
        asset.currentValue = 0;
        asset.unrealizedPL = 0;
    }
    
    asset.totalPL = asset.realizedPL + asset.unrealizedPL;

    if (asset.totalInvested > 0 && (asset.realizedPL !== 0 || asset.unrealizedPL !== 0)) {
        asset.totalPLPercentage = (asset.totalPL / asset.totalInvested) * 100;
    } else if (asset.totalInvested === 0 && asset.totalPL !== 0 && asset.quantity === 0) {
        // Handle cases like airdrops sold, where totalInvested might be 0
        // This logic might need refinement based on how airdrops/gifts are recorded
        asset.totalPLPercentage = asset.totalPL !== 0 ? 100 : 0; 
    }
    else {
        asset.totalPLPercentage = 0;
    }


    if (Math.abs(asset.quantity) < 1e-9) asset.quantity = 0;
    if (Math.abs(asset.currentValue) < 1e-9) asset.currentValue = 0;
    if (Math.abs(asset.totalCostBasis) < 1e-9) asset.totalCostBasis = 0;
    if (Math.abs(asset.realizedPL) < 1e-9) asset.realizedPL = 0;
    if (Math.abs(asset.unrealizedPL) < 1e-9) asset.unrealizedPL = 0;
    if (Math.abs(asset.totalPL) < 1e-9) asset.totalPL = 0;
    if (Math.abs(asset.totalPLPercentage) < 1e-9) asset.totalPLPercentage = 0;
  });

  const finalPortfolio = {};
  Object.values(portfolio).forEach(asset => {
    if (asset.quantity > 1e-9 || asset.realizedPL !== 0 || asset.transactions.length > 0) {
      finalPortfolio[asset.asset_name] = asset;
    }
  });

  return finalPortfolio;
};
