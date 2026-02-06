import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiLock, FiUnlock, FiShield, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { apiGetCards, apiFreezeCard, apiUnfreezeCard, apiBlockCard, apiGetCardPIN } from '../../services/bankApi';
import { maskCardNumber, getCardType } from '../../services/paymentGatewayService';
import { useBuggy } from '../../context/BuggyContext';
import './Cards.css';

const Cards = () => {
  const session = getCurrentSession();
  const { buggyOperation } = useBuggy();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showPINModal, setShowPINModal] = useState(false);
  const [cardPIN, setCardPIN] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      const response = await apiGetCards(session.userId);
      if (response.success) setCards(response.data);
    } catch (err) {
      console.error('Error loading cards:', err);
    }
  };

  const handleFreezeToggle = async (card) => {
    setLoading(true);
    setError('');

    try {
      await buggyOperation(async () => {
        let result;
        if (card.status === 'frozen') {
          result = await apiUnfreezeCard(session.userId, card.id);
        } else if (card.status === 'active') {
          result = await apiFreezeCard(session.userId, card.id);
        }

        if (result && result.success) {
          loadCards();
        } else {
          setError(result?.error?.message || 'Operation failed');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async (card) => {
    if (!confirm('Are you sure you want to block this card? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await buggyOperation(async () => {
        const result = await apiBlockCard(session.userId, card.id);

        if (result.success) {
          loadCards();
        } else {
          setError(result.error?.message || 'Failed to block card');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleShowPIN = async (card) => {
    setSelectedCard(card);
    setError('');

    try {
      await buggyOperation(async () => {
        const result = await apiGetCardPIN(session.userId, card.id);

        if (result.success) {
          setCardPIN(result.data.pin);
          setShowPINModal(true);
        } else {
          setError(result.error?.message || 'Failed to get PIN');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const closePINModal = () => {
    setShowPINModal(false);
    setCardPIN('');
    setSelectedCard(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'frozen':
        return 'status-frozen';
      case 'blocked':
        return 'status-blocked';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FiUnlock />;
      case 'frozen':
        return <FiLock />;
      case 'blocked':
        return <FiShield />;
      default:
        return null;
    }
  };

  return (
    <div className="cards-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Virtual Cards</h1>
        <p>Manage your virtual payment cards</p>
      </motion.div>

      {error && (
        <motion.div
          className="alert alert-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid="alert-error"
        >
          {error}
        </motion.div>
      )}

      <div className="cards-grid">
        {cards.length === 0 ? (
          <div className="empty-state">
            <FiCreditCard size={48} />
            <p>No virtual cards found</p>
          </div>
        ) : (
          cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`virtual-card ${getStatusColor(card.status)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid="card-item"
            >
              <div className="card-content">
                <div className="card-header">
                  <div className="card-type">{getCardType(card.cardNumber).toUpperCase()}</div>
                  <div className={`card-status ${getStatusColor(card.status)}`}>
                    {getStatusIcon(card.status)}
                    <span>{card.status}</span>
                  </div>
                </div>

                <div className="card-number">
                  {maskCardNumber(card.cardNumber)}
                </div>

                <div className="card-footer">
                  <div className="card-holder">
                    <div className="label">Cardholder</div>
                    <div className="value">{card.cardholderName}</div>
                  </div>
                  <div className="card-expiry">
                    <div className="label">Expires</div>
                    <div className="value">{card.expiry}</div>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {card.status !== 'blocked' && (
                  <button
                    className="action-btn"
                    onClick={() => handleFreezeToggle(card)}
                    disabled={loading}
                    data-testid={card.status === 'frozen' ? 'btn-unfreeze' : 'btn-freeze'}
                  >
                    {card.status === 'frozen' ? <FiUnlock /> : <FiLock />}
                    {card.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                  </button>
                )}

                {card.status !== 'blocked' && (
                  <button
                    className="action-btn action-danger"
                    onClick={() => handleBlockCard(card)}
                    disabled={loading}
                    data-testid="btn-block"
                  >
                    <FiShield />
                    Block
                  </button>
                )}

                <button
                  className="action-btn"
                  onClick={() => handleShowPIN(card)}
                  disabled={loading}
                  data-testid="btn-show-pin"
                >
                  <FiEye />
                  Show PIN
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* PIN Modal */}
      <AnimatePresence>
        {showPINModal && (
          <>
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePINModal}
            />
            <motion.div
              className="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              data-testid="modal-pin"
            >
              <div className="modal-header">
                <h3>Card PIN</h3>
                <button className="modal-close" onClick={closePINModal} data-testid="btn-close-modal">
                  <FiX />
                </button>
              </div>
              <div className="modal-body">
                <p>PIN for card ending in {selectedCard?.cardNumber.slice(-4)}</p>
                <div className="pin-display" data-testid="pin-display">
                  {cardPIN}
                </div>
                <p className="pin-warning">
                  ⚠️ Keep this PIN secure. Do not share it with anyone.
                </p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={closePINModal} data-testid="btn-close-pin">
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cards;
