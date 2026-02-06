import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiChevronRight, FiChevronLeft, FiAlertCircle, FiDollarSign } from 'react-icons/fi';
import { getCurrentSession } from '../../services/authService';
import { apiApplyForLoan, apiGetLoanApplications } from '../../services/bankApi';
import { LOAN_OPTIONS } from '../../utils/seeder';
import { useBuggy } from '../../context/BuggyContext';
import './Loan.css';

const Loan = () => {
  const session = getCurrentSession();
  const { buggyOperation } = useBuggy();

  const [currentStep, setCurrentStep] = useState(1);
  const [loanType, setLoanType] = useState('');
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    const response = await apiGetLoanApplications(session.userId);
    if (response.success) setApplications(response.data);
  };

  const selectedLoanOption = LOAN_OPTIONS.find(l => l.id === loanType);

  const calculateMonthlyPayment = () => {
    if (!selectedLoanOption || !amount || !term) return 0;

    const principal = parseFloat(amount);
    const monthlyRate = selectedLoanOption.interestRate / 100 / 12;
    const numPayments = parseInt(term);

    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    return monthlyPayment;
  };

  const handleNext = () => {
    setError('');

    if (currentStep === 1) {
      if (!loanType) {
        setError('Please select a loan type');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const loanAmount = parseFloat(amount);
      const loanTerm = parseInt(term);

      if (!amount || isNaN(loanAmount) || loanAmount <= 0) {
        setError('Please enter a valid loan amount');
        return;
      }

      if (!term || isNaN(loanTerm) || loanTerm <= 0) {
        setError('Please enter a valid loan term');
        return;
      }

      if (selectedLoanOption) {
        if (loanAmount < selectedLoanOption.minAmount || loanAmount > selectedLoanOption.maxAmount) {
          setError(`Loan amount must be between $${selectedLoanOption.minAmount.toLocaleString()} and $${selectedLoanOption.maxAmount.toLocaleString()}`);
          return;
        }

        if (loanTerm < selectedLoanOption.minTerm || loanTerm > selectedLoanOption.maxTerm) {
          setError(`Loan term must be between ${selectedLoanOption.minTerm} and ${selectedLoanOption.maxTerm} months`);
          return;
        }
      }

      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await buggyOperation(async () => {
        const response = await apiApplyForLoan(
          session.userId,
          loanType,
          parseFloat(amount),
          parseInt(term)
        );

        if (response.success) {
          setSuccess('Loan application submitted successfully!');
          setCurrentStep(1);
          setLoanType('');
          setAmount('');
          setTerm('');
          loadApplications();
        } else {
          setError(response.error?.message || 'Application failed');
        }
      });
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the application');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  return (
    <div className="loan-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Loan Application</h1>
        <p>Apply for personal or home loans with competitive rates</p>
      </motion.div>

      {(error || success) && (
        <motion.div
          className={`alert ${error ? 'alert-error' : 'alert-success'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid={error ? 'alert-error' : 'alert-success'}
        >
          {error ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{error || success}</span>
        </motion.div>
      )}

      <div className="loan-layout">
        {/* Wizard */}
        <motion.div
          className="loan-wizard"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Progress Steps */}
          <div className="wizard-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-number" data-testid="step-1">1</div>
              <div className="step-label">Loan Type</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-number" data-testid="step-2">2</div>
              <div className="step-label">Details</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number" data-testid="step-3">3</div>
              <div className="step-label">Review</div>
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="wizard-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2>Select Loan Type</h2>
                <div className="loan-types">
                  {LOAN_OPTIONS.map(loan => (
                    <label
                      key={loan.id}
                      className={`loan-type-card ${loanType === loan.id ? 'selected' : ''}`}
                      data-testid={`loan-type-${loan.id}`}
                    >
                      <input
                        type="radio"
                        name="loanType"
                        value={loan.id}
                        checked={loanType === loan.id}
                        onChange={(e) => setLoanType(e.target.value)}
                      />
                      <div className="loan-type-content">
                        <h3>{loan.name}</h3>
                        <p className="loan-description">{loan.description}</p>
                        <div className="loan-details">
                          <div className="detail-item">
                            <span className="detail-label">Interest Rate</span>
                            <span className="detail-value">{loan.interestRate}% p.a.</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Amount Range</span>
                            <span className="detail-value">
                              ${loan.minAmount.toLocaleString()} - ${loan.maxAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Term Range</span>
                            <span className="detail-value">
                              {loan.minTerm} - {loan.maxTerm} months
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="wizard-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2>Loan Details</h2>
                <form className="loan-form">
                  <div className="form-group">
                    <label htmlFor="amount">Loan Amount (USD) *</label>
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      min={selectedLoanOption?.minAmount}
                      max={selectedLoanOption?.maxAmount}
                      data-testid="input-amount"
                      required
                    />
                    {selectedLoanOption && (
                      <span className="form-hint">
                        Range: ${selectedLoanOption.minAmount.toLocaleString()} - ${selectedLoanOption.maxAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="term">Loan Term (months) *</label>
                    <input
                      type="number"
                      id="term"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      placeholder="Enter term in months"
                      min={selectedLoanOption?.minTerm}
                      max={selectedLoanOption?.maxTerm}
                      data-testid="input-term"
                      required
                    />
                    {selectedLoanOption && (
                      <span className="form-hint">
                        Range: {selectedLoanOption.minTerm} - {selectedLoanOption.maxTerm} months
                      </span>
                    )}
                  </div>

                  {amount && term && selectedLoanOption && (
                    <div className="calculation-preview">
                      <FiDollarSign />
                      <div>
                        <div className="preview-label">Estimated Monthly Payment</div>
                        <div className="preview-value">
                          ${calculateMonthlyPayment().toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="wizard-content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2>Review & Submit</h2>
                <div className="review-summary">
                  <div className="summary-item">
                    <span className="summary-label">Loan Type</span>
                    <span className="summary-value">{selectedLoanOption?.name}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Loan Amount</span>
                    <span className="summary-value">${parseFloat(amount).toLocaleString()}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Loan Term</span>
                    <span className="summary-value">{term} months</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Interest Rate</span>
                    <span className="summary-value">{selectedLoanOption?.interestRate}% p.a.</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Monthly Payment</span>
                    <span className="summary-value">${calculateMonthlyPayment().toFixed(2)}</span>
                  </div>
                  <div className="summary-item highlight">
                    <span className="summary-label">Total Amount Payable</span>
                    <span className="summary-value">
                      ${(calculateMonthlyPayment() * parseInt(term)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="wizard-actions">
            {currentStep > 1 && (
              <button
                className="btn btn-secondary"
                onClick={handleBack}
                disabled={loading}
                data-testid="btn-back"
              >
                <FiChevronLeft />
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                className="btn btn-primary"
                onClick={handleNext}
                data-testid="btn-next"
              >
                Next
                <FiChevronRight />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
                data-testid="btn-submit"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </motion.div>

        {/* Existing Applications */}
        <motion.div
          className="applications-list"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2>Your Applications</h2>

          {applications.length === 0 ? (
            <div className="empty-state">
              <p>No loan applications yet</p>
            </div>
          ) : (
            <div className="applications">
              {applications.map(app => (
                <div key={app.id} className="application-card" data-testid="loan-application">
                  <div className="application-header">
                    <h3>{app.loanTypeName}</h3>
                    <span className={`application-status ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="application-details">
                    <div className="detail">
                      <span>Amount:</span>
                      <strong>${app.amount.toLocaleString()}</strong>
                    </div>
                    <div className="detail">
                      <span>Term:</span>
                      <strong>{app.term} months</strong>
                    </div>
                    <div className="detail">
                      <span>Interest Rate:</span>
                      <strong>{app.interestRate}%</strong>
                    </div>
                    <div className="detail">
                      <span>Monthly Payment:</span>
                      <strong>${app.monthlyPayment.toFixed(2)}</strong>
                    </div>
                    <div className="detail">
                      <span>Applied:</span>
                      <strong>{new Date(app.applicationDate).toLocaleDateString()}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Loan;
