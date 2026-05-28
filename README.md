# ETT Malawi Dashboard

A React + Vite dashboard app for ETT Malawi, built with Tailwind CSS.

**Live app:** https://YOUR-USERNAME.github.io/ett-malawi-dashboard/

---

## Tech stack

- React 19
- Vite 6
- Tailwind CSS 4
- TypeScript
- Lucide React icons
- Framer Motion

---

## Run locally

**Requirements:** Node.js 18+

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR-USERNAME/ett-malawi-dashboard.git
   cd ett-malawi-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment (optional — only needed for AI features):
   ```bash
   cp .env.example .env.local
   # Add your GEMINI_API_KEY in .env.local
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3000

---

## Project structure

```
ett-malawi-dashboard/
├── src/
│   ├── components/       # Page and UI components
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
│   │   └── storage.ts    # Local storage helpers
│   ├── App.tsx           # Root app component
│   ├── main.tsx          # Entry point
│   ├── data.ts           # Static data
│   ├── types.ts          # TypeScript types
│   └── index.css         # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml    # Auto-deploy to GitHub Pages
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## Deploy

Pushing to the `main` branch automatically builds and deploys to GitHub Pages via GitHub Actions.

Make sure GitHub Pages is enabled in your repo settings:
**Settings → Pages → Source → gh-pages branch**
