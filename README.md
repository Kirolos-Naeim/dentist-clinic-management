# Dentist Clinic Management System

Offline-first dentist clinic management system built with React, Vite, Express, and SQLite.

## One command setup

```bash
npm run setup
```

That single command will:
- install root dependencies
- install backend dependencies
- install frontend dependencies
- create the SQLite database
- create all required tables
- seed sample data
- start backend and frontend together

## Project structure

```text
dentist-clinic-management/
├── backend/               # Express API and SQLite logic
├── frontend/              # React + Vite UI
├── database/              # Reserved local database folder for packaging/backups
├── electron/              # Optional desktop wrapper
├── package.json           # Root scripts for one-command setup
├── setup.js               # Automated install + init + start script
└── README.md
```

## Local URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Health check: http://localhost:4000/api/health

## Available commands

### One-click setup and launch

```bash
npm run setup
```

### Run backend + frontend together

```bash
npm run dev
```

### Initialize database only

```bash
npm run init-db
```

### Build frontend

```bash
npm run build
```

### Desktop mode

```bash
npm run desktop
```

This builds the frontend, starts backend plus preview server, then opens the app in Electron.

## Backend

Features:
- Express REST API
- SQLite file database
- automatic schema creation
- automatic sample data seeding
- offline local storage
- revenue, cost, gross profit, and net profit calculations

### Main API endpoints

- `GET /api/dashboard`
- `GET /api/dashboard/reports?range=daily|monthly`
- `GET/POST/PUT/DELETE /api/patients`
- `POST /api/patients/:id/visits`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST /api/invoices`
- `GET /api/invoices/:id`
- `GET/POST/PUT/DELETE /api/expenses`

## Frontend

Pages included:
- Dashboard
- Patients
- Services
- Inventory
- Billing
- Reports
- Expenses

UI includes:
- Tailwind responsive layout
- Chart.js reporting widgets
- patient search by name or phone
- billing preview with auto totals
- inventory alerts
- expense summaries

## Database schema

The setup creates these main tables:
- patients
- patient_visits
- services
- products
- invoices
- invoice_items
- expenses

SQLite file path:
- `backend/data/clinic.sqlite`

## Sample seeded data

On first setup the app seeds:
- patients
- patient visits
- services
- products
- expenses
- sample invoices and invoice items

## Auto calculations

### Service cost

```text
service_cost = material_cost + labor_cost + overhead_cost
```

### Invoice total and profit

```text
invoice_total = sum(service price × quantity)
invoice_cost = sum(service cost × quantity)
profit = revenue - cost
```

### Reporting

```text
monthly_revenue = sum(invoice total_price)
net_profit = sum(invoice profit) - sum(expenses)
```

## Troubleshooting

### Port already in use

If port `4000` or `5173` is already busy:
- stop the other process using that port
- or update `.env` values in backend and frontend

### Delete and recreate dependencies

```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm run setup
```

### Reset database

```bash
rm -f backend/data/clinic.sqlite
npm run init-db
```

### Frontend cannot reach backend

Check:
- backend is running on port `4000`
- frontend `.env` has `VITE_API_URL=http://localhost:4000/api`
- backend `.env` has `FRONTEND_URL=http://localhost:5173`

## Notes

- Works fully locally without cloud services
- SQLite makes it easy to move or back up the database file
- After dependencies are installed once, the app works offline
  <img width="1920" height="1080" alt="Screenshot (4)" src="https://github.com/user-attachments/assets/0b3a81a6-c2d7-44f5-af3d-afd0df6dd915" />
<img width="1920" height="1080" alt="Screenshot (3)" src="https://github.com/user-attachments/assets/517d0deb-30f7-4167-ad1d-de1be4f069c0" />
<img width="1920" height="1080" alt="Screenshot (2)" src="https://github.com/user-attachments/assets/96a840a1-73af-4896-86a9-e03e62306b31" />

