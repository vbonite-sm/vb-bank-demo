# VB Bank - Mock Banking Website

A premium mock banking application built with React and Vite for automation testing purposes. Features separate User and Admin portals with pre-seeded dummy data.

## Features

### User Portal
- **Account Dashboard**: View balance, account details, and recent transactions
- **Money Transfer**: Send money to other VB Bank users with recipient search
- **Transaction History**: View all transactions with filters and export to CSV
- **Top Up**: Add funds via a mock payment gateway with quick-select amounts
- **Bill Pay**: Pay utility bills (Electric, Water, Internet, Gas, Phone, Streaming)
- **Loan Application**: Apply for personal, auto, home, or education loans
- **Virtual Cards**: Manage virtual debit/credit cards with freeze/unfreeze
- **Account Settings**: Update profile, change password, and manage preferences
- **Crypto Portfolio**: Real-time Bitcoin & Ethereum portfolio tracking via CoinGecko API
- **Live Currency Rates**: Real-time exchange rates from external API
- **Responsive Design**: Premium UI with dark theme and glassmorphism effects

### Admin Portal
- **System Dashboard**: Overview of all users, balances, and transactions
- **User Management**: View and search all user accounts
- **Transaction Monitoring**: Track all system transactions
- **Analytics Charts**: Visual representation of transaction trends

### Mock Payment Gateway
- **Secure Gateway Simulation**: Simulated payment flow with card input
- **Test Card Support**: Pre-filled test card for easy testing
- **Transaction Deduplication**: Guards against duplicate deposits

### Mock REST API Layer
- **Realistic API Simulation**: All operations wrapped in async REST-like API calls
- **Service Worker Interception**: API calls visible in DevTools Network tab with proper methods, URLs, headers, and bodies
- **JWT Token Authentication**: Access tokens (15 min) + refresh tokens (7 days) with auto-refresh
- **Sensitive Data Masking**: Passwords, tokens, PINs, account numbers, and card numbers are masked in Network tab payloads
- **OpenAPI/Swagger Documentation**: Full API spec at `/api-docs/` with interactive Swagger UI
- **Configurable Behavior**: Adjustable latency, error rates, and logging

## Tech Stack

- **React 18.3** - UI framework
- **Vite 6.0** - Build tool and dev server
- **React Router 6** - Routing and navigation
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Icons** - Icon library
- **date-fns** - Date formatting utilities
- **uuid** - Unique ID generation
- **Vanilla CSS** - Custom styling with CSS variables

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Test Accounts

The application comes with pre-seeded test data:

### User Accounts
| Full Name | Username | Password | Account Number | Starting Balance |
|-----------|----------|----------|----------------|------------------|
| John Doe | `john.doe` | `user123` | `1234567890` | $15,000.00 |
| Jane Smith | `jane.smith` | `user123` | `2345678901` | $25,000.50 |
| Mike Wilson | `mike.wilson` | `user123` | `3456789012` | $8,500.75 |

### Admin Account
- **Username**: `admin` | **Password**: `admin123`

### Testing Money Transfers
Use these account numbers to test transfer functionality:
- Transfer TO Jane Smith: `2345678901`
- Transfer TO Mike Wilson: `3456789012`
- Transfer TO John Doe: `1234567890`

## Project Structure

```
vb-bank/
├── public/
│   ├── mockServiceWorker.js          # Service Worker for Network tab visibility
│   └── api-docs/
│       ├── index.html                 # Swagger UI viewer
│       └── openapi.json               # OpenAPI 3.0 specification
├── src/
│   ├── components/
│   │   ├── Layout.jsx / Layout.css
│   │   ├── ProtectedRoute.jsx
│   │   ├── CryptoWidget.jsx / CryptoWidget.css
│   │   ├── BuggyToggle.jsx / BuggyToggle.css
│   ├── context/
│   │   └── BuggyContext.jsx
│   ├── pages/
│   │   ├── Login.jsx / Register.jsx / Auth.css
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx / AdminDashboard.css
│   │   │   └── UserManagement.jsx / UserManagement.css
│   │   ├── gateway/
│   │   │   └── MockGateway.jsx / MockGateway.css
│   │   └── user/
│   │       ├── Dashboard.jsx / Dashboard.css
│   │       ├── Transfer.jsx / Transfer.css
│   │       ├── History.jsx / History.css
│   │       ├── TopUp.jsx / TopUp.css
│   │       ├── BillPay.jsx / BillPay.css
│   │       ├── Cards.jsx / Cards.css
│   │       ├── Loan.jsx / Loan.css
│   │       └── Settings.jsx / Settings.css
│   ├── services/
│   │   ├── mockApi.js                 # Core mock API layer + SW bridge + data masking
│   │   ├── authApi.js                 # Auth API endpoints (login, register, logout, refresh)
│   │   ├── bankApi.js                 # Banking API endpoints (transfers, cards, loans, etc.)
│   │   ├── adminApi.js                # Admin API endpoints (user management, stats)
│   │   ├── tokenService.js            # JWT token generation, validation, and refresh
│   │   ├── authService.js             # Authentication business logic
│   │   ├── bankService.js             # Banking business logic
│   │   ├── adminService.js            # Admin business logic
│   │   ├── apiService.js              # External API calls (currency rates)
│   │   ├── cryptoService.js           # Crypto price API service
│   │   └── paymentGatewayService.js   # Mock payment gateway logic
│   ├── styles/
│   │   ├── variables.css
│   │   └── global.css
│   ├── utils/
│   │   └── seeder.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vercel.json
├── vite.config.js
├── package.json
└── README.md
```

## Key Features Explained

### Authentication & Security
- Role-based authentication (User vs Admin)
- JWT-like token system with access tokens (15 min) and refresh tokens (7 days)
- Automatic silent token refresh on expiry
- Session management using localStorage
- Protected routes with token validation and auto-refresh
- Quick login buttons for testing
- Smart greeting ("Welcome" for new users, "Welcome back" for returning users)
- Sensitive data masking in Network tab (passwords, tokens, PINs, account/card numbers)

### Banking Operations
- Transfer money between accounts
- Top up account via mock payment gateway
- Pay utility bills to various providers
- Apply for loans (Personal, Auto, Home, Education)
- Manage virtual debit/credit cards
- View transaction history with filters and CSV export
- Real-time balance updates

### Crypto Portfolio
- Real-time Bitcoin & Ethereum price tracking via CoinGecko API
- Portfolio value calculation
- Price caching (1-minute TTL)
- Fallback prices on API failure

### Admin Features
- System-wide statistics
- User account management
- Transaction monitoring
- Data visualization with charts

### External API Integration
- **Currency Rates**: Live exchange rates via ExchangeRate-API (1-hour cache)
- **Crypto Prices**: Real-time BTC/ETH prices via CoinGecko API (1-minute cache)
- Fallback to cached data on API failure
- Support for popular currencies

### Mock Payment Gateway
- Simulated card payment flow
- Test card auto-fill for easy testing
- Transaction deduplication to prevent double charges
- Success/failure redirect handling

### Mock API Layer
- All operations go through async REST-like API calls (`mockApi.js`)
- Service Worker intercepts `/api/*` requests so they appear in DevTools Network tab
- Proper HTTP methods, status codes, headers, and JSON request/response bodies
- Bearer token `Authorization` headers on authenticated requests
- Configurable simulated latency (200–800ms) and error injection
- Centralized sensitive data sanitizer masks passwords, JWT tokens, PINs, account numbers, and card numbers in Network payloads — app data stays intact

### API Documentation
- OpenAPI 3.0 specification with 32 endpoints and 11 schemas
- Interactive Swagger UI at `/api-docs/`
- Bearer auth security scheme documented
- Try-it-out examples for all endpoints

### Data Persistence
- All data stored in localStorage
- Automatic data seeding on first load
- No backend required
- Perfect for automation testing

## Development

### Mock Data
The application uses localStorage to simulate a backend. Data is automatically seeded on first load. To reset the data, open the browser console and run:

```javascript
localStorage.clear();
location.reload();
```

### Token Service (Dev Console)
The token service is exposed on `window.__tokenService` for debugging:

```javascript
// View current token info
window.__tokenService.getTokenInfo();

// Decode the access token payload
window.__tokenService.decodeToken();

// Manually refresh the access token
window.__tokenService.refreshAccessToken();
```

### API Documentation
Swagger UI is available at `/api-docs/` when the dev server is running. The raw OpenAPI spec is at `/api-docs/openapi.json`.

### APIs Used
- **Currency Rates**: [ExchangeRate-API](https://open.er-api.com/) — free, no API key required
- **Crypto Prices**: [CoinGecko API](https://api.coingecko.com/) — free, no API key required

## Playwright Test Automation

This application is specifically designed for Playwright test automation practice. All interactive elements have `data-testid` attributes for reliable test selectors.

### Test ID Conventions

#### Authentication
- `input-username` - Username input field
- `input-password` - Password input field
- `input-email` - Email input field (registration)
- `input-fullname` - Full name input field (registration)
- `input-confirm-password` - Confirm password field (registration)
- `btn-login` - Login button
- `btn-register` - Register button
- `btn-quick-login-user` - Quick login as user
- `btn-quick-login-admin` - Quick login as admin
- `link-register` - Link to registration page
- `link-login` - Link to login page

#### Navigation
- `nav-dashboard` - Dashboard navigation link
- `nav-transfer` - Transfer navigation link
- `nav-history` - History navigation link
- `nav-top-up` - Top Up navigation link
- `nav-bill-pay` - Bill Pay navigation link
- `nav-cards` - Virtual Cards navigation link
- `nav-loan` - Loan navigation link
- `nav-settings` - Settings navigation link
- `nav-admin-dashboard` - Admin dashboard link
- `nav-admin-users` - User management link
- `btn-logout` - Logout button
- `btn-sidebar-toggle` - Sidebar toggle button

#### Dashboard
- `balance-amount` - Current balance display
- `account-number` - Account number display
- `stat-deposits` - Total deposits stat
- `stat-transfers` - Total transfers stat
- `stat-transactions` - Total transactions stat
- `transaction-item-{index}` - Individual transaction items
- `currency-rate-{code}` - Currency rate items
- `btn-refresh-rates` - Refresh currency rates button

#### Transfer
- `input-recipient-account` - Recipient account number input
- `input-amount` - Transfer amount input
- `input-description` - Transfer description textarea
- `btn-submit-transfer` - Submit transfer button
- `search-result-{index}` - Recipient search results
- `alert-error` - Error message display
- `alert-success` - Success message display

#### History
- `filter-all` - All transactions filter
- `filter-income` - Income filter
- `filter-expense` - Expense filter
- `input-search` - Transaction search input
- `btn-export-csv` - Export CSV button
- `transaction-row-{index}` - Transaction table rows

#### Top Up
- `input-amount` - Top up amount input
- `btn-quick-{amount}` - Quick select amount buttons (50, 100, 250, 500)
- `btn-proceed` - Proceed to payment button
- `current-balance` - Current balance display
- `alert-error` / `alert-success` - Status messages

#### Bill Pay
- Provider and payment method selection
- Account number and amount inputs
- Payment confirmation flow

#### Virtual Cards
- Card management (create, freeze, unfreeze, delete)
- Card details display

#### Loan Application
- Loan type selection (Personal, Auto, Home, Education)
- Amount and term inputs
- Application submission and tracking

#### Settings
- Profile update form
- Password change form
- Preference toggles

#### Admin Dashboard
- `stat-total-users` - Total users statistic
- `stat-total-balance` - Total balance statistic
- `stat-total-transactions` - Total transactions statistic
- `stat-total-deposits` - Total deposits statistic

#### User Management
- `input-search-users` - User search input
- `user-row-{index}` - User table rows
- `btn-view-details-{userId}` - View user details button
- `modal-user-details` - User details modal
- `btn-close-modal` - Close modal button

### Example Playwright Test

```javascript
import { test, expect } from '@playwright/test';

test('user can login and transfer money', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000');

  // Login as John Doe
  await page.getByTestId('input-username').fill('john.doe');
  await page.getByTestId('input-password').fill('user123');
  await page.getByTestId('btn-login').click();

  // Verify dashboard loaded
  await expect(page.getByTestId('balance-amount')).toBeVisible();

  // Navigate to transfer page
  await page.getByTestId('nav-transfer').click();

  // Fill transfer form
  await page.getByTestId('input-recipient-account').fill('2345678901');
  await page.getByTestId('input-amount').fill('100');
  await page.getByTestId('input-description').fill('Test transfer');

  // Submit transfer
  await page.getByTestId('btn-submit-transfer').click();

  // Verify success
  await expect(page.getByTestId('alert-success')).toBeVisible();
});
```

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### Netlify

1. Build the project:
```bash
npm run build
```

2. Drag and drop the `dist` folder to Netlify

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a mock application created for testing purposes only.

## Notes

- This is NOT a real banking application
- Do not use for actual financial transactions
- All data is mock and for demonstration only
- Perfect for automation testing, UI demos, and learning
