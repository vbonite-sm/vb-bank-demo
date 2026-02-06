# Complete data-testid Reference

This document provides a comprehensive list of all data-testid attributes available for test automation.

## Authentication Pages

### Login (`/login`)
- `input-username` - Username input field
- `input-password` - Password input field
- `btn-login` - Login button
- `btn-quick-login-user` - Quick login as user button
- `btn-quick-login-admin` - Quick login as admin button
- `link-register` - Link to registration page
- `alert-error` - Error message display

### Register (`/register`)
- `input-fullname` - Full name input field
- `input-username` - Username input field
- `input-email` - Email input field
- `input-password` - Password input field
- `input-confirm-password` - Confirm password field
- `btn-register` - Register button
- `link-login` - Link to login page
- `alert-error` - Error message display

## Navigation (Layout Component)
- `nav-dashboard` - Dashboard navigation link
- `nav-transfer` - Transfer navigation link
- `nav-history` - History navigation link
- `nav-top-up` - Top Up navigation link
- `nav-bill-pay` - Bill Pay navigation link
- `nav-cards` - Virtual Cards navigation link
- `nav-loan` - Loan navigation link
- `nav-settings` - Settings navigation link
- `nav-admin-dashboard` - Admin dashboard link (admin only)
- `nav-admin-users` - User management link (admin only)
- `btn-logout` - Logout button
- `btn-sidebar-toggle` - Sidebar toggle button

## User Pages

### Dashboard (`/dashboard`)
- `balance-amount` - Current balance display
- `account-number` - Account number display
- `stat-total-deposits` - Total deposits statistic
- `stat-total-transfers-out` - Total transfers statistic
- `stat-total-transactions` - Total transactions statistic
- `transaction-item-{index}` - Individual transaction items (0, 1, 2, etc.)
- `currency-item-{index}` - Currency rate items
- `btn-refresh-rates` - Refresh currency rates button
- `crypto-total-value` - Total crypto portfolio value
- `crypto-asset-btc` - Bitcoin asset card
- `crypto-asset-eth` - Ethereum asset card
- `btn-crypto-refresh` - Refresh crypto prices button
- `btn-crypto-retry` - Retry loading crypto data

### Transfer (`/transfer`)
- `available-balance` - Available balance display
- `input-recipient-account` - Recipient account number input
- `search-results` - Search results container
- `search-result-{index}` - Individual search result items
- `input-amount` - Transfer amount input
- `input-description` - Transfer description textarea
- `btn-submit-transfer` - Submit transfer button
- `alert-error` - Error message display
- `alert-success` - Success message display

### History (`/history`)
- `filter-btn-all` - All transactions filter button
- `filter-btn-income` - Income filter button
- `filter-btn-expense` - Expense filter button
- `input-search` - Transaction search input
- `input-start-date` - Start date filter input
- `input-end-date` - End date filter input
- `input-min-amount` - Minimum amount filter input
- `input-max-amount` - Maximum amount filter input
- `btn-clear-filters` - Clear all filters button
- `btn-export-csv` - Export to CSV button
- `transaction-row-{index}` - Transaction table rows

### Top Up (`/top-up`)
- `current-balance` - Current balance display
- `input-amount` - Top up amount input
- `btn-quick-50` - Quick select $50 button
- `btn-quick-100` - Quick select $100 button
- `btn-quick-250` - Quick select $250 button
- `btn-quick-500` - Quick select $500 button
- `btn-proceed` - Proceed to payment button
- `alert-error` - Error message display
- `alert-success` - Success message display

### Bill Pay (`/bill-pay`)
- `select-provider` - Bill provider dropdown
- `input-amount` - Bill payment amount input
- `input-description` - Payment description textarea
- `radio-payment-account` - Pay from account radio button
- `radio-payment-card` - Pay from card radio button
- `btn-submit-payment` - Submit payment button
- `bill-history-item` - Bill payment history items
- `alert-error` - Error message display
- `alert-success` - Success message display

### Cards (`/cards`)
- `card-item` - Virtual card item
- `btn-freeze` - Freeze card button
- `btn-unfreeze` - Unfreeze card button
- `btn-block` - Block card button
- `btn-show-pin` - Show PIN button
- `modal-pin` - PIN display modal
- `pin-display` - PIN number display
- `btn-close-modal` - Close modal button
- `btn-close-pin` - Close PIN modal button
- `alert-error` - Error message display

### Loan (`/loans`)
- `step-1` - Loan type selection step indicator
- `step-2` - Loan details step indicator
- `step-3` - Review step indicator
- `loan-type-{id}` - Loan type selection cards (personal, auto, home, education)
- `input-amount` - Loan amount input
- `input-term` - Loan term input (months)
- `btn-back` - Back to previous step button
- `btn-next` - Next step button
- `btn-submit` - Submit loan application button
- `loan-application` - Loan application history items
- `alert-error` - Error message display
- `alert-success` - Success message display

### Settings (`/settings`)
- `tab-profile` - Profile settings tab
- `tab-password` - Password settings tab
- `input-fullname` - Full name input
- `input-dob` - Date of birth input
- `input-email` - Email input
- `input-phone` - Phone number input
- `input-address` - Address input
- `input-current-password` - Current password input
- `input-new-password` - New password input
- `input-confirm-password` - Confirm new password input
- `btn-save-profile` - Save profile button
- `btn-save-password` - Save password button
- `alert-error` - Error message display
- `alert-success` - Success message display

## Gateway Page

### Mock Gateway (`/gateway`)
- `payment-amount` - Payment amount display
- `input-card-number` - Card number input
- `input-cardholder-name` - Cardholder name input
- `input-expiry` - Card expiry date input
- `input-cvv` - CVV input
- `btn-pay` - Pay now button
- `btn-cancel` - Cancel payment button
- `alert-error` - Error message display

## Admin Pages

### Admin Dashboard (`/admin/dashboard`)
- `stat-total-users` - Total users statistic
- `stat-total-balance` - Total system balance statistic
- `stat-total-transactions` - Total transactions statistic
- `stat-total-deposits` - Total deposits statistic

### User Management (`/admin/users`)
- `input-search-users` - User search input
- `user-row-{index}` - User table rows (0, 1, 2, etc.)
- `btn-view-user-{index}` - View user details button
- `user-details-modal` - User details modal
- `modal-transaction-{index}` - Transaction items in user details modal
- `btn-close-modal` - Close modal button

## Test Examples

### Example 1: Login Flow
```javascript
await page.getByTestId('input-username').fill('john.doe');
await page.getByTestId('input-password').fill('user123');
await page.getByTestId('btn-login').click();
await expect(page.getByTestId('balance-amount')).toBeVisible();
```

### Example 2: Money Transfer
```javascript
await page.getByTestId('nav-transfer').click();
await page.getByTestId('input-recipient-account').fill('2345678901');
await page.getByTestId('input-amount').fill('100');
await page.getByTestId('input-description').fill('Test transfer');
await page.getByTestId('btn-submit-transfer').click();
await expect(page.getByTestId('alert-success')).toBeVisible();
```

### Example 3: Filter Transaction History
```javascript
await page.getByTestId('nav-history').click();
await page.getByTestId('filter-btn-income').click();
await page.getByTestId('input-search').fill('salary');
await expect(page.getByTestId('transaction-row-0')).toBeVisible();
```

### Example 4: Admin User Search
```javascript
await page.getByTestId('nav-admin-users').click();
await page.getByTestId('input-search-users').fill('john');
await page.getByTestId('btn-view-user-0').click();
await expect(page.getByTestId('user-details-modal')).toBeVisible();
```

## Notes

- All `{index}` values are zero-based (0, 1, 2, etc.)
- All `{id}` values match the item's unique identifier
- Error/success alerts use consistent test IDs across all pages
- Navigation items are available in the Layout component on all protected routes
