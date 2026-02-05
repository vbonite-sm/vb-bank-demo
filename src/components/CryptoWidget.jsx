import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw } from 'react-icons/fi';
import { FaBitcoin } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { calculatePortfolioValue, clearPriceCache } from '../services/cryptoService';
import { getCurrentSession } from '../services/authService';
import { getUsers } from '../utils/seeder';
import './CryptoWidget.css';

const CryptoWidget = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchPortfolio = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        clearPriceCache();
      } else {
        setLoading(true);
      }

      const session = getCurrentSession();
      if (!session) {
        throw new Error('No active session');
      }

      const users = getUsers();
      const user = users.find(u => u.id === session.userId);

      if (!user || !user.crypto) {
        throw new Error('User crypto data not found');
      }

      const portfolioData = await calculatePortfolioValue(user.crypto);
      setPortfolio(portfolioData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching crypto portfolio:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleRefresh = () => {
    fetchPortfolio(true);
  };

  if (loading && !portfolio) {
    return (
      <div className="crypto-widget">
        <div className="crypto-widget-header">
          <h3>Crypto Portfolio</h3>
        </div>
        <div className="crypto-widget-loading">
          <FiRefreshCw className="spinning" />
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crypto-widget">
        <div className="crypto-widget-header">
          <h3>Crypto Portfolio</h3>
        </div>
        <div className="crypto-widget-error">
          <p>Error loading portfolio</p>
          <button onClick={() => fetchPortfolio()} data-testid="btn-crypto-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCrypto = (amount, decimals = 8) => {
    return amount.toFixed(decimals);
  };

  const formatUSD = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      className="crypto-widget"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="crypto-widget-header">
        <h3>Crypto Portfolio</h3>
        <button
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleRefresh}
          disabled={refreshing}
          data-testid="btn-crypto-refresh"
        >
          <FiRefreshCw className={refreshing ? 'spinning' : ''} />
        </button>
      </div>

      <div className="crypto-widget-total">
        <div className="total-label">Total Value</div>
        <div className="total-value" data-testid="crypto-total-value">
          {formatUSD(portfolio?.totalValue || 0)}
        </div>
      </div>

      <div className="crypto-assets">
        {/* Bitcoin */}
        <motion.div
          className="crypto-asset"
          whileHover={{ scale: 1.02 }}
          data-testid="crypto-asset-btc"
        >
          <div className="asset-icon bitcoin">
            <FaBitcoin />
          </div>
          <div className="asset-details">
            <div className="asset-header">
              <span className="asset-name">Bitcoin</span>
              <span className="asset-symbol">BTC</span>
            </div>
            <div className="asset-holdings">
              {formatCrypto(portfolio?.holdings.BTC || 0, 8)} BTC
            </div>
            <div className="asset-price">
              ${portfolio?.prices.BTC?.toLocaleString() || '0'} per BTC
            </div>
          </div>
          <div className="asset-value">
            {formatUSD(portfolio?.values.BTC || 0)}
          </div>
        </motion.div>

        {/* Ethereum */}
        <motion.div
          className="crypto-asset"
          whileHover={{ scale: 1.02 }}
          data-testid="crypto-asset-eth"
        >
          <div className="asset-icon ethereum">
            <SiEthereum />
          </div>
          <div className="asset-details">
            <div className="asset-header">
              <span className="asset-name">Ethereum</span>
              <span className="asset-symbol">ETH</span>
            </div>
            <div className="asset-holdings">
              {formatCrypto(portfolio?.holdings.ETH || 0, 6)} ETH
            </div>
            <div className="asset-price">
              ${portfolio?.prices.ETH?.toLocaleString() || '0'} per ETH
            </div>
          </div>
          <div className="asset-value">
            {formatUSD(portfolio?.values.ETH || 0)}
          </div>
        </motion.div>
      </div>

      {portfolio?.lastUpdated && (
        <div className="crypto-widget-footer">
          <span className="last-updated">
            Last updated: {new Date(portfolio.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default CryptoWidget;
