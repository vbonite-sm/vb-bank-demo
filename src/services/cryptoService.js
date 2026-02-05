// Crypto Service - Fetches real-time cryptocurrency prices from CoinGecko API

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd';
const CACHE_DURATION = 60000; // 1 minute in milliseconds

let priceCache = {
  data: null,
  timestamp: null
};

/**
 * Fetch real-time crypto prices from CoinGecko API
 * Cached for 1 minute to avoid excessive API calls
 */
export const getCryptoPrices = async () => {
  // Check if cache is valid (less than 1 minute old)
  if (priceCache.data && priceCache.timestamp && Date.now() - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  try {
    const response = await fetch(COINGECKO_API);

    if (!response.ok) {
      throw new Error('Failed to fetch crypto prices');
    }

    const data = await response.json();

    // Transform to our format
    const prices = {
      BTC: data.bitcoin?.usd || 0,
      ETH: data.ethereum?.usd || 0,
      lastUpdated: new Date().toISOString()
    };

    // Update cache
    priceCache = {
      data: prices,
      timestamp: Date.now()
    };

    return prices;
  } catch (error) {
    console.error('Error fetching crypto prices:', error);

    // Return cached data if available, even if expired
    if (priceCache.data) {
      return priceCache.data;
    }

    // Return fallback prices if cache is empty
    return {
      BTC: 45000,
      ETH: 2500,
      lastUpdated: new Date().toISOString(),
      error: 'Using fallback prices'
    };
  }
};

/**
 * Calculate portfolio value based on user's crypto holdings
 * @param {Object} holdings - User's crypto holdings { BTC: 0.5, ETH: 2.0 }
 * @returns {Object} Portfolio details with values
 */
export const calculatePortfolioValue = async (holdings) => {
  if (!holdings || (holdings.BTC === 0 && holdings.ETH === 0)) {
    return {
      holdings: { BTC: 0, ETH: 0 },
      values: { BTC: 0, ETH: 0 },
      totalValue: 0,
      prices: { BTC: 0, ETH: 0 }
    };
  }

  const prices = await getCryptoPrices();

  const btcValue = (holdings.BTC || 0) * prices.BTC;
  const ethValue = (holdings.ETH || 0) * prices.ETH;
  const totalValue = btcValue + ethValue;

  return {
    holdings: {
      BTC: holdings.BTC || 0,
      ETH: holdings.ETH || 0
    },
    values: {
      BTC: btcValue,
      ETH: ethValue
    },
    totalValue,
    prices: {
      BTC: prices.BTC,
      ETH: prices.ETH
    },
    lastUpdated: prices.lastUpdated
  };
};

/**
 * Format crypto amount with appropriate decimals
 */
export const formatCryptoAmount = (amount, symbol) => {
  if (symbol === 'BTC') {
    return amount.toFixed(8);
  } else if (symbol === 'ETH') {
    return amount.toFixed(6);
  }
  return amount.toFixed(2);
};

/**
 * Clear the price cache (useful for forcing a refresh)
 */
export const clearPriceCache = () => {
  priceCache = {
    data: null,
    timestamp: null
  };
};
