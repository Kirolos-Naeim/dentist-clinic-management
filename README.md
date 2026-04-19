# Dentist Clinic Management System

Local offline-first clinic management system for dentists.

## Project Structure

```text
dentist-clinic-management/
├── backend/
│   ├── data/                    # SQLite database file generated locally
│   ├── src/
│   │   ├── config/              # Environment loading
│   │   ├── controllers/         # Route handlers
│   │   ├── db/                  # SQLite connection + schema init
│   │   ├── middleware/          # Error handling
│   │   ├── routes/              # Express REST routes
│   │   ├── services/            # Dashboard/report queries
│   │   ├── utils/               # Validation/helpers
│   │   └── server.js            # App entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/                 # REST client
│   │   ├── components/          # Reusable UI blocks
│   │   ├── hooks/               # Data fetching hook
│   │   ├── layouts/             # Shell/sidebar layout
│   │   ├── pages/               # Dashboard, patients, services, inventory, billing, reports, expenses
│   │   ├── utils/               # Formatting helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Backend

- Express REST API
- SQLite local file database
- Zod validation
- Auto database initialization + seed data
- Revenue, profit, and report calculations

### Main API Endpoints

- `GET /api/dashboard`
- `GET /api/dashboard/reports`
- `GET/POST/PUT/DELETE /api/patients`
- `POST /api/patients/:id/visits`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST /api/invoices`
- `GET /api/invoices/:id`
- `GET/POST/PUT/DELETE /api/expenses`

## Frontend

- React + Vite
- Tailwind CSS modern dashboard UI
- Chart.js revenue and service charts
- Sidebar navigation
- CRUD forms with validation and error handling
- Billing screen with invoice preview
- Reports and expense summaries

## Features Covered

### Dashboard
- Daily revenue
- Monthly revenue
- Total patients
- Net profit
- Revenue over time chart
- Services distribution chart
- Inventory alerts

### Patients
- Add, edit, delete patients
- View patient visit history
- Add visit notes with diagnosis, treatment, payment status

### Services
- CRUD services
- Auto total cost and profit per service

### Inventory
- CRUD products
- Low stock and expiring alerts
- Stock value calculation

### Billing
- Select patient
- Add multiple services
- Auto total bill, cost, and profit calculation
- Save invoice locally

### Reports
- Daily and monthly reports
- Revenue, costs, gross profit, expenses, net profit, patient count

### Expenses
- Track rent, salaries, utilities, and other fixed costs
- Monthly total expense summary

## Setup Instructions

### 1. Install

```bash
cd dentist-clinic-management
npm run install:all
```

### 2. Configure environment files

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend:

```bash
cd frontend
cp .env.example .env
```

### 3. Initialize database

```bash
cd backend
npm run init-db
```

This creates `backend/data/clinic.sqlite`.

### 4. Run backend

```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:4000`.

### 5. Run frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Notes

- Fully local, uses SQLite file storage.
- Works offline after dependencies are installed.
- Seed data is added automatically for services and inventory if tables are empty.
- Frontend production build was verified successfully.

## Formulas Used

### Service profit

```text
profit = selling_price - (material_cost + labor_cost + overhead_cost)
```

### Daily / Monthly profit

```text
revenue = sum(invoice total_price)
cost = sum(invoice total_cost)
gross_profit = revenue - cost
net_profit = gross_profit - expenses
```
