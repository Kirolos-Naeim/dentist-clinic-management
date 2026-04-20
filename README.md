# Dentist Clinic Manager

Offline-first dentist clinic management system packaged as an Electron desktop app, with React for the UI, Express for the API, and SQLite for local storage.

## Features

- Desktop application, no browser required in production
- Dashboard with revenue, profit, patients, and charts
- Patients CRUD and visit history
- Services CRUD with cost and profit calculations
- Inventory tracking and low-stock alerts
- Billing and invoice generation
- Reports with daily and monthly totals
- Expense tracking
- 100% offline, local SQLite database

## Project structure

```text
dentist-clinic-management/
├── backend/
├── frontend/
├── electron/
│   └── main.js
├── database/
├── package.json
├── setup.js
└── README.md
```

## Development

### One-command setup

```bash
npm run setup
```

This will:
- install root dependencies
- install backend dependencies
- install frontend dependencies
- create `.env` files if missing
- initialize SQLite schema
- seed sample data
- start the app

### Run development mode

```bash
npm run dev
```

Development mode starts:
- backend server on `http://127.0.0.1:4000`
- frontend Vite dev server on `http://127.0.0.1:5173`
- Electron window loading the app

## Build Windows .exe

```bash
npm run build
```

This will:
- build the React frontend
- package the Electron app using `electron-builder`
- generate a Windows NSIS installer `.exe`

### Build output

The generated installer will be inside:

```text
dist/
```

Expected output includes a file like:

```text
dist/Dentist Clinic Manager Setup <version>.exe
```

## Desktop runtime behavior

- Electron starts the backend automatically
- React frontend is loaded from built files in production
- SQLite database is stored locally
- No internet or cloud services required

## Database

SQLite file path:

```text
database/clinic.sqlite
```

Tables created automatically:
- patients
- patient_visits
- services
- products
- invoices
- invoice_items
- expenses

Sample data is inserted automatically on first run.

## Available commands

```bash
npm run setup
npm run dev
npm run init-db
npm run build
npm run desktop
```

## Troubleshooting

### Electron opens but frontend is blank

Run:

```bash
npm run build-frontend
```

Then rebuild:

```bash
npm run build
```

### Database reset

Delete the local database and recreate it:

```bash
rm -f database/clinic.sqlite
npm run init-db
```

### Port conflict in development

If port `4000` or `5173` is already used, stop the other app first or update the environment files.

### Windows packaging note

To generate a real Windows `.exe`, run `npm run build` on Windows, or in a Windows CI/build environment. Cross-building Windows installers from Linux is not reliable.

## Notes

- Fully local and offline
- No external APIs
- Electron package config is already included
- Installer target is `nsis`
