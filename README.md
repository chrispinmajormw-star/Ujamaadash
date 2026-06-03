# ETT Malawi Dashboard (Ujamaadash)

A React + Vite dashboard app for ETT Malawi, built with Tailwind CSS and PostgreSQL backend.

**Live app:** https://YOUR-USERNAME.github.io/ett-malawi-dashboard/

---

## Tech stack

### Frontend
- React 19
- Vite 6
- Tailwind CSS 4
- TypeScript
- Lucide React icons
- Framer Motion

### Backend
- Node.js 20+
- Express.js
- PostgreSQL
- JWT Authentication
- PM2 (Process Manager)
- Nginx (Reverse Proxy)

---

## Architecture

This application now consists of:
- **Frontend**: React dashboard (this directory)
- **Backend**: RESTful API with PostgreSQL database (see `backend/` directory)

The backend provides:
- RESTful API endpoints for all data models
- JWT-based authentication
- Role-based access control
- PostgreSQL database with optimized schema
- AWS EC2 deployment ready

---

## Run locally

**Requirements:** Node.js 18+, PostgreSQL 12+

### Frontend Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ett-malawi-dashboard.git
   cd ett-malawi-dashboard
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Set up frontend environment:
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY and VITE_API_URL in .env.local
   ```

4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   Frontend runs at http://localhost:3000

### Backend Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up backend environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Run database migrations:
   ```bash
   npm run migrate
   ```

4. Seed database (optional):
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Backend runs at http://localhost:5000

---

## Project structure

```
ett-malawi-dashboard/
├── backend/               # Backend API (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── database/      # Schema and migrations
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   ├── deploy/            # Deployment scripts
│   ├── package.json
│   └── README.md
├── src/
│   ├── components/        # Page and UI components
│   │   ├── Dashboard.tsx
│   │   ├── ImpactPage.tsx
│   │   ├── MapsPage.tsx
│   │   ├── CalendarPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── CurriculumPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── SubComponents.tsx
│   ├── utils/
│   │   ├── storage.ts     # Local storage helpers
│   │   └── api.ts         # API client for backend
│   ├── App.tsx            # Root app component
│   ├── main.tsx           # Entry point
│   ├── data.ts            # Static data
│   ├── types.ts           # TypeScript types
│   └── index.css          # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml     # Auto-deploy to GitHub Pages
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## AWS EC2 Deployment

See `backend/README.md` for detailed AWS EC2 deployment instructions.

Quick setup:
1. Launch EC2 instance (Ubuntu 20.04+)
2. Run `backend/deploy/ec2-setup.sh` to install dependencies
3. Upload backend code to `/var/www/ujamaadash-backend`
4. Configure `.env` with production values
5. Run `backend/deploy/deploy.sh` to deploy
6. Configure Nginx as reverse proxy

---

## API Documentation

The backend provides RESTful API endpoints for:
- Authentication (login, register)
- Users management
- Reports (CRUD + comments)
- Clusters
- Districts
- Tasks
- Trainings
- Documents
- Case Referrals
- SASA Monthly Reports

See `backend/README.md` for complete API documentation.

---

## Default Users

After running seed script, these users are created (password: `password123`):
- admin@ujamaa.mw (admin)
- tot1@ujamaa.mw (TOT)
- de1@ujamaa.mw (Data Entry)
- dc1@ujamaa.mw (District Coordinator)
- sasa1@ujamaa.mw (SASA Officer)
- pm1@ujamaa.mw (Program Manager)

**Important:** Change these passwords in production!

---

## Deploy Frontend

Pushing to the `main` branch automatically builds and deploys the frontend to GitHub Pages via GitHub Actions.

Make sure GitHub Pages is enabled in your repo settings:
**Settings → Pages → Source → gh-pages branch**
