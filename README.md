# M.I.T.R.A. Dashboard

A Next.js 14 + Tailwind CSS dashboard inspired by the Mahindra MITRA agricultural management platform.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** for styling
- **Recharts** for bar charts
- **Lucide React** for icons
- **DM Sans** font (Google Fonts)

## File Structure

```
mitra-dashboard/
├── app/
│   ├── layout.tsx         # Root layout with font + metadata
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Tailwind + Google Fonts import
├── components/
│   ├── Sidebar.tsx        # Collapsible dark sidebar with nav
│   ├── Header.tsx         # Filter bar (Month, Year, From, To)
│   ├── StatCards.tsx      # 7 animated stat cards
│   ├── ZoneComplaintsChart.tsx  # Recharts bar chart
│   └── ZoneMTTRChart.tsx        # Horizontal progress bars
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.js
```

## Features
- ✅ Collapsible sidebar
- ✅ Animated number counters on stat cards
- ✅ Zone-wise complaints bar chart (Recharts)
- ✅ Zone-wise MTTR horizontal bars
- ✅ Fully responsive layout
- ✅ Date range filters
