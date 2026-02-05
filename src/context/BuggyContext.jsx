import { createContext, useContext, useState } from 'react';

const BuggyContext = createContext();

export const useBuggy = () => {
  const context = useContext(BuggyContext);
  if (!context) {
    throw new Error('useBuggy must be used within a BuggyProvider');
  }
  return context;
};

export const BuggyProvider = ({ children }) => {
  const [isBuggyMode, setIsBuggyMode] = useState(false);

  // Toggle buggy mode on/off
  const toggleBuggyMode = () => {
    setIsBuggyMode(prev => !prev);
  };

  // Inject random delays (500-3000ms) when buggy mode is active
  const injectDelay = async () => {
    if (!isBuggyMode) return;

    const delay = Math.floor(Math.random() * 2500) + 500; // 500-3000ms
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  // Randomly throw errors (30% chance) when buggy mode is active
  const maybeThrowError = () => {
    if (!isBuggyMode) return;

    const shouldThrow = Math.random() < 0.3; // 30% chance
    if (shouldThrow) {
      const errors = [
        'Network timeout occurred',
        'Service temporarily unavailable',
        'Invalid session token',
        'Database connection lost',
        'Request rate limit exceeded',
        'Internal server error',
        'Transaction processing failed'
      ];
      const randomError = errors[Math.floor(Math.random() * errors.length)];
      throw new Error(randomError);
    }
  };

  // Combined async operation with potential delay and error
  const buggyOperation = async (operation) => {
    try {
      await injectDelay();
      maybeThrowError();
      return await operation();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    isBuggyMode,
    toggleBuggyMode,
    injectDelay,
    maybeThrowError,
    buggyOperation
  };

  return (
    <BuggyContext.Provider value={value}>
      {children}
    </BuggyContext.Provider>
  );
};

export default BuggyContext;
