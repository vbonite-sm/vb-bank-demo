# VB Bank - Mock Banking Website

A premium mock banking application built with React and Vite for automation testing purposes. Features separate User and Admin portals with pre-seeded dummy data.

## Features

### User Portal
- **Account Dashboard**: View balance, account details, and recent transactions
- **Money Transfer**: Send money to other VB Bank users with recipient search
- **Transaction History**: View all transactions with filters and export to CSV
- **Live Currency Rates**: Real-time exchange rates from external API
- **Responsive Design**: Premium UI with dark theme and glassmorphism effects

### Admin Portal
- **System Dashboard**: Overview of all users, balances, and transactions
- **User Management**: View and search all user accounts
- **Transaction Monitoring**: Track all system transactions
- **Analytics Charts**: Visual representation of transaction trends

## Tech Stack

- **React 18.3** - UI framework
- **Vite 6.0** - Build tool and dev server
- **React Router 6** - Routing and navigation
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Icons** - Icon library
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
│   └── vb-logo.svg
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.css
│   │   │   ├── UserManagement.jsx
│   │   │   └── UserManagement.css
│   │   ├── user/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Dashboard.css
│   │   │   ├── Transfer.jsx
│   │   │   ├── Transfer.css
│   │   │   ├── History.jsx
│   │   │   └── History.css
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Auth.css
│   ├── services/
│   │   ├── authService.js
│   │   ├── bankService.js
│   │   ├── adminService.js
│   │   └── apiService.js
│   ├── styles/
│   │   ├── variables.css
│   │   └── global.css
│   ├── utils/
│   │   └── seeder.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Key Features Explained

### Authentication
- Role-based authentication (User vs Admin)
- Session management using localStorage
- Protected routes with automatic redirects
- Quick login buttons for testing

### Banking Operations
- Transfer money between accounts
- View transaction history
- Real-time balance updates
- Transaction filtering and search

### Admin Features
- System-wide statistics
- User account management
- Transaction monitoring
- Data visualization with charts

### External API Integration
- Live currency exchange rates
- Caching mechanism (1-hour cache)
- Fallback to cached data on API failure
- Support for popular currencies

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

### Currency API
The app uses the free [ExchangeRate-API](https://open.er-api.com/) for real-time currency rates. No API key required.

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
