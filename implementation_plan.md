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
- Create directory structure: `src/components`, `src/pages`, `src/services`, `src/styles`

### Styling Strategy
#### [NEW] [Design System]
- `src/styles/variables.css`: Define CSS variables for premium color palette (Dark mode logic, gradients, glassmorphism), typography (Inter/Roboto), and spacing.
- `src/styles/global.css`: Reset and base styles.

### Component Architecture

#### Services (Mock Backend & External APIs)
- `src/services/authService.js`: Handle login (User/Admin) and session management.
- `src/services/bankService.js`: Core banking logic (transfers, calculations).
- `src/services/adminService.js`: Admin-specific data fetching.
- `src/services/apiService.js`: Fetch real-time currency rates from free API (e.g., `open.er-api.com`).
- `src/utils/seeder.js`: Generate dummy users and transactions on init.

#### Pages (User)
- `src/pages/user/Dashboard.jsx`: User home (includes Live Currency Ticker).
- `src/pages/user/Transfer.jsx`: Money transfer.
- `src/pages/user/History.jsx`: Transaction history.

#### Pages (Admin)
- `src/pages/admin/AdminDashboard.jsx`: System stats.
- `src/pages/admin/UserManagement.jsx`: List and manage users.

#### Shared
- `src/pages/Login.jsx`: Unified login (checks credentials against seeded data).
- `src/components/Layout.jsx`: Responsive layout wrapper.

## Verification Plan

### Manual Verification
- **Auth Flow**: Register a new user, log in, verify session persistence.
- **Banking Operations**:
    - Check initial zero/default balance.
    - Perform a transfer and verify balance update.
    - Check transaction history implies the correct record.
- **Responsiveness**: Verify layout on different viewport sizes.

## Deployment Strategy
- **Hosting**: Vercel or Netlify (Free Tier).
- **URL**: Will provide a URL like `https://vb-bank-simulation.vercel.app` which serves nicely as a "fake bank" identity for testing.
- **CI/CD**: Manual deploy or GitHub integration.
