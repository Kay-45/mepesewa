# MePesewa 💚
### Your household financial coach — built for Ghana

---

## What's inside

| Module | Description |
|---|---|
| 🏠 Dashboard | Income waterfall, pocket money tracker, spend-rate gauge |
| ➕ Add Expense | 16 Ghanaian categories, MoMo auto-fee calculator |
| 📲 MoMo Calculator | MTN, Telecel & AirtelTigo full tariff bands |
| 🤖 AI Coach | Claude-powered financial coach that knows your budget |
| 🔔 Reminders | Bill due dates, savings nudges, auto-suggested from setup |
| 📋 History | Filterable expense log + savings goals tracker |
| 🧙 Setup Wizard | Single or couple mode, income, fixed bills, savings target |

---

## Local preview

```bash
npm install
cp .env.example .env
# Fill in VITE_ANTHROPIC_API_KEY in .env
npm run dev
```
Open http://localhost:5173

---

## Deploy to Netlify

```bash
npm run build
# Then drag the /dist folder to netlify.com/drop
# OR connect your GitHub repo in Netlify UI:
#   Build command: npm run build
#   Publish directory: dist
#   Add env vars in Site Settings
```

---

## Env variables needed
- VITE_ANTHROPIC_API_KEY — from console.anthropic.com (for AI Coach)
- VITE_FIREBASE_* — from Firebase Console (optional, for multi-device sync)

> For production: proxy the Anthropic API through a Netlify Function so your key is never exposed.
