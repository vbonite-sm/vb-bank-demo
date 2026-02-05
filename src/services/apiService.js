// External API Service - Fetch real-time currency exchange rates

const API_BASE_URL = 'https://open.er-api.com/v6/latest';
const CACHE_KEY = 'vb_bank_currency_rates';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Get cached rates if available and not expired
const getCachedRates = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    return null;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
};

// Cache rates in localStorage
const cacheRates = (data) => {
  try {
    const cacheData = {
      data: data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching rates:', error);
  }
};

// Fetch currency exchange rates
export const fetchExchangeRates = async (baseCurrency = 'USD') => {
  try {
    // Check cache first
    const cached = getCachedRates();
    if (cached && cached.base_code === baseCurrency) {
      return {
        success: true,
        data: cached,
        fromCache: true
      };
    }

    // Fetch from API
    const response = await fetch(`${API_BASE_URL}/${baseCurrency}`);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();

    if (data.result === 'success') {
      // Cache the successful response
      cacheRates(data);

      return {
        success: true,
        data: data,
        fromCache: false
      };
    } else {
      throw new Error('Invalid response from currency API');
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error);

    // Return cached data if available, even if expired
    const cached = getCachedRates();
    if (cached) {
      return {
        success: true,
        data: cached,
        fromCache: true,
        warning: 'Using cached data due to API error'
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to fetch currency rates'
    };
  }
};

// Get specific rate
export const getExchangeRate = async (from = 'USD', to = 'EUR') => {
  try {
    const result = await fetchExchangeRates(from);

    if (result.success && result.data.rates) {
      const rate = result.data.rates[to];
      if (rate) {
        return {
          success: true,
          rate: rate,
          from: from,
          to: to,
          timestamp: result.data.time_last_update_utc
        };
      }
    }

    return {
      success: false,
      error: 'Exchange rate not available'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Convert amount between currencies
export const convertCurrency = async (amount, from = 'USD', to = 'EUR') => {
  try {
    const result = await getExchangeRate(from, to);

    if (result.success) {
      const converted = amount * result.rate;
      return {
        success: true,
        originalAmount: amount,
        convertedAmount: converted,
        from: from,
        to: to,
        rate: result.rate,
        timestamp: result.timestamp
      };
    }

    return {
      success: false,
      error: result.error
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Get popular currencies for display
export const getPopularCurrencies = async () => {
  const popular = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

  try {
    const result = await fetchExchangeRates('USD');

    if (result.success && result.data.rates) {
      const rates = popular
        .filter(currency => result.data.rates[currency])
        .map(currency => ({
          code: currency,
          rate: result.data.rates[currency],
          name: getCurrencyName(currency)
        }));

      return {
        success: true,
        rates: rates,
        baseCurrency: 'USD',
        timestamp: result.data.time_last_update_utc,
        fromCache: result.fromCache
      };
    }

    return {
      success: false,
      error: 'Failed to fetch currency rates'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Helper function to get currency name
const getCurrencyName = (code) => {
  const currencyNames = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    JPY: 'Japanese Yen',
    AUD: 'Australian Dollar',
    CAD: 'Canadian Dollar',
    CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee',
    MXN: 'Mexican Peso',
    BRL: 'Brazilian Real',
    ZAR: 'South African Rand',
    RUB: 'Russian Ruble',
    KRW: 'South Korean Won',
    SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar',
    NOK: 'Norwegian Krone',
    SEK: 'Swedish Krona',
    DKK: 'Danish Krone',
    PLN: 'Polish Zloty'
  };

  return currencyNames[code] || code;
};

// Get currency symbol
export const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    AUD: 'A$',
    CAD: 'C$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    MXN: 'Mex$',
    BRL: 'R$',
    ZAR: 'R',
    RUB: '₽',
    KRW: '₩',
    SGD: 'S$',
    HKD: 'HK$',
    NOK: 'kr',
    SEK: 'kr',
    DKK: 'kr',
    PLN: 'zł'
  };

  return symbols[code] || code;
};
