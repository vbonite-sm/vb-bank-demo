# Mock Banking Website Implementation Plan

## Goal Description
Build a simulated banking website ("VB Bank") for automation testing purposes with distinct **User** and **Admin** portals. The app will include pre-seeded dummy data for users and transactions to facilitate immediate testing.

## User Review Required
> [!NOTE]
> **Roles defined**:
> - **User**: Can view own balance, transfer money, view history.
> - **Admin**: Can view all users, total system reserves, and transaction logs.
>
> **Data Strategy**: App will auto-seed `localStorage` with dummy data on first load if empty.
> [!NOTE]
> This project will use **Vite + React** for the application framework and **Vanilla CSS** for styling, adhering to the requirement for premium aesthetics without external UI libraries like Tailwind (unless requested).
>
> **Expanded User Data**: User profiles will now include rich PII for testing: Passport Number, Driver's License, Full Address, and Phone Number.

## Proposed Changes

### Core Setup
#### [NEW] [Project Structure]
- Initialize Vite React project in `c:/Users/ADMIN/OneDrive/Desktop/vb-bank`
- Install dependencies:
    - `react-router-dom`: Navigation
    - `framer-motion`: High-quality animations (page transitions, hover effects)
    - `react-icons`: comprehensive icon set
    - `recharts`: Data visualization for banking dashboard
    - `clsx`: Conditional class management
    - `uuid`: For generating unique IDs
    - `date-fns`: Date manipulation
- Create directory structure: `src/components`, `src/pages`, `src/services`, `src/styles`

### Styling Strategy
#### [NEW] [Design System]
- `src/styles/variables.css`: Define CSS variables for premium color palette (Dark mode logic, gradients, glassmorphism), typography (Inter/Roboto), and spacing.
- `src/styles/global.css`: Reset and base styles.

### Component Architecture

#### Services (Mock Backend & External APIs)
- `src/context/BuggyContext.jsx`: [NEW] Context provider to inject random artificial errors/delays when "Buggy Mode" is active.
- `src/services/authService.js`: Handle login (User/Admin) and session management.
- `src/services/bankService.js`: Core banking logic (transfers, calculations, bill pay, loans).
- `src/services/paymentGateway.js`: [NEW] Simulates an external payment processor. Handles redirects for "Bill Pay with Card" and "Top Up".
- `src/services/cryptoService.js`: [NEW] Fetches real-time crypto prices (Bitcoin, Ethereum) via CoinGecko Public API.
- `src/services/adminService.js`: Admin-specific data fetching.
- `src/services/apiService.js`: Fetch real-time currency rates from free API (e.g., `open.er-api.com`).
- `src/utils/seeder.js`: Generate dummy users and transactions. Uses `randomuser.me` API. [NEW] Seeds usage data:
    - **Utility Providers**: (VB Power, etc.)
    - **Virtual Cards**: (1-2 active cards per user)
    - **Loan Options**: (Personal Loan @ 12%, Home Loan @ 5%)
    - **Crypto Holdings**: (Random small amounts of BTC/ETH)

#### Pages (User)
- `src/pages/user/Dashboard.jsx`: User home (Live Currency Ticker + [NEW] Crypto Portfolio Widget).
- `src/pages/user/Transfer.jsx`: Money transfer.
- `src/pages/user/History.jsx`: Transaction history with [NEW] Filters (Date range, type, amount) and Search.
- `src/pages/user/BillPay.jsx`: [NEW] Pay utilities. Select Provider from seeded list. **Options**: "Pay from Account" OR "Pay with Card".
- `src/pages/user/Cards.jsx`: [NEW] Manage virtual cards (Freeze, Block, Show PIN).
- `src/pages/user/Loan.jsx`: [NEW] 3-step Wizard for loan applications.
- `src/pages/user/Settings.jsx`: [NEW] View/Edit Profile (Update PII: Passport, Address, etc.).
- `src/pages/user/TopUp.jsx`: [NEW] "Add Money" flow that redirects to the Mock Gateway.

#### Apps (External Simulation)
- `src/pages/gateway/MockGateway.jsx`: [NEW] A standalone, unbranded payment page simulating a 3rd party checkout (Stripe/PayPal style).
    - Accepts: Card Number, CVC, Expiry.
    - Used by: **Bill Pay** (external card) and **Top Up**.

#### Pages (Admin)
- `src/pages/admin/AdminDashboard.jsx`: System stats.
- `src/pages/admin/UserManagement.jsx`: List and manage users.

#### Shared
- `src/pages/Login.jsx`: Unified login (checks credentials against seeded data).
- `src/components/Layout.jsx`: Responsive layout wrapper.
- `src/components/BuggyToggle.jsx`: [NEW] Floating toggle to enable/disable "Buggy Mode".

## Verification Plan

### Manual Verification
- **Auth Flow**: Register a new user, log in, verify session persistence.
- **Banking Operations**:
    - Check initial zero/default balance.
    - Perform a transfer and verify balance update.
    - Check transaction history implies the correct record.
- **New Features**:
    - **Bills**: Submit a bill payment and verify deduction.
    - **Loan**: Complete 3-step wizard and check for "Pending" loan status.
    - **Settings**: Edit phone number and verify it persists on refresh.
    - **Buggy Mode**: Turn on and verify random API failures.
    - **Payment Gateway**: Verify "Bill Pay with Card" redirects to Gateway, accepts mock card, and returns to success screen.
- **Responsiveness**: Verify layout on different viewport sizes.

## Deployment Strategy
- **Hosting**: Vercel or Netlify (Free Tier).
- **URL**: Will provide a URL like `https://vb-bank-simulation.vercel.app` which serves nicely as a "fake bank" identity for testing.
- **CI/CD**: Manual deploy or GitHub integration.
