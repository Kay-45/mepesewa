# MePesewa — Firebase & Netlify Setup Guide

Follow these steps in order. Takes about 20-25 minutes total.

---

## PART 1: Firebase Setup (10 min)

### Step 1 — Create the project
1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Name it `mepesewa` (or anything you like) → continue through the prompts
4. Disable Google Analytics if asked (not needed) → **Create project**

### Step 2 — Register your web app
1. On the project overview page, click the **`</>`** (web) icon
2. App nickname: `MePesewa Web`
3. Do NOT check "Firebase Hosting" (we're using Netlify)
4. Click **Register app**
5. You'll see a `firebaseConfig` object like this — **copy these values**, you'll need them in Step 5:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "mepesewa-xxxxx.firebaseapp.com",
  projectId: "mepesewa-xxxxx",
  storageBucket: "mepesewa-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 3 — Enable Authentication
1. Left sidebar → **Build > Authentication** → **Get started**
2. Click **Email/Password** → toggle **Enable** → **Save**

### Step 4 — Enable Firestore Database
1. Left sidebar → **Build > Firestore Database** → **Create database**
2. Choose **Start in production mode** → pick a location close to Ghana (e.g. `eur3 (europe-west)`) → **Enable**
3. Go to the **Rules** tab
4. Delete everything there and paste the contents of `firestore.rules` (included in this zip)
5. Click **Publish**

### Step 5 — Add Firebase keys to your project
1. In your MePesewa folder, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste in the values from Step 2:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=mepesewa-xxxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mepesewa-xxxxx
   VITE_FIREBASE_STORAGE_BUCKET=mepesewa-xxxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

---

## PART 2: Anthropic API Key (3 min)

1. Go to https://console.anthropic.com
2. Sign in → left sidebar → **API Keys** → **Create Key**
3. Name it `mepesewa-coach` → copy the key (starts with `sk-ant-`)
4. Add it to your `.env` file (same file as above):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   ⚠️ Note: NO `VITE_` prefix on this one — it stays server-side only.

---

## PART 3: Local preview with everything working (5 min)

The AI Coach calls a Netlify Function, so use the Netlify CLI for local dev (not plain `npm run dev`) so the function works too.

```bash
# 1. Install dependencies
npm install

# 2. Install Netlify CLI globally (one-time)
npm install -g netlify-cli

# 3. Link env vars and run dev server WITH functions support
netlify dev
```

This opens **http://localhost:8888** (note: 8888, not 5173) — that's the Netlify dev proxy that runs both your React app AND the AI Coach function together.

Test it:
- Complete the setup wizard
- Add an expense → check MoMo fee calculation
- Go to the Coach tab → ask "Am I on track this month?" → it should respond using Claude

---

## PART 4: Deploy to Netlify (7 min)

### Step 1 — Push to GitHub
```bash
cd mepesewa
git init
git add .
git commit -m "Initial MePesewa build"
```
Create a new repo on https://github.com/new, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/mepesewa.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect to Netlify
1. Go to https://app.netlify.com → **Add new site > Import an existing project**
2. Choose **GitHub** → authorize → select your `mepesewa` repo
3. Build settings should auto-fill from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**

### Step 3 — Add environment variables on Netlify
1. Once deployed, go to **Site configuration > Environment variables**
2. Click **Add a variable** and add ALL of these (same values as your local `.env`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `ANTHROPIC_API_KEY`
3. Go to **Deploys** tab → **Trigger deploy > Deploy site** (so the new env vars take effect)

### Step 4 — Add your Netlify domain to Firebase
1. Copy your live URL (e.g. `https://mepesewa-abc123.netlify.app`)
2. Back in Firebase Console → **Authentication > Settings > Authorized domains**
3. Click **Add domain** → paste your Netlify URL (without `https://`)

✅ Your app is now live with working auth, Firestore sync, and AI coach.

---

## Quick troubleshooting

| Problem | Fix |
|---|---|
| Coach tab shows "Connection issue" locally | You're running `npm run dev` instead of `netlify dev` — functions only work with the latter |
| Coach tab shows "Connection issue" on live site | Check `ANTHROPIC_API_KEY` is set in Netlify env vars, then redeploy |
| "Firebase not configured" warning in console | `.env` is missing or you haven't restarted the dev server after editing it |
| Couple mode partner can't see shared data | Double-check both partners used the same invite code, and Firestore rules were published |
| Blank page after deploy | Check the Netlify deploy log for build errors; confirm `dist` is the publish directory |
