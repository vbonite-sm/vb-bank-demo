import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import { FaBug } from 'react-icons/fa';
import { useBuggy } from '../context/BuggyContext';
import './BuggyToggle.css';

const BuggyToggle = () => {
  const { isBuggyMode, toggleBuggyMode } = useBuggy();

  return (
    <div className="buggy-toggle-container">
      <AnimatePresence>
        {isBuggyMode && (
          <motion.div
            className="buggy-indicator"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <FiAlertTriangle className="buggy-indicator-icon" />
            <span>Buggy Mode Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className={`buggy-toggle-btn ${isBuggyMode ? 'active' : ''}`}
        onClick={toggleBuggyMode}
        data-testid="btn-buggy-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isBuggyMode ? 'Disable Buggy Mode' : 'Enable Buggy Mode'}
      >
        {isBuggyMode ? <FiX size={24} /> : <FaBug size={24} />}
      </motion.button>
    </div>
  );
};

export default BuggyToggle;
