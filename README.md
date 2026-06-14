# 🌟 Aurora — AI-Powered Mobile Health Companion

> *Understand yourself better every day.*

Aurora is an intelligent mobile health companion that combines health tracking, personalized AI insights, and voice interaction into a single premium experience.

---

## 📱 Demo

| Dashboard | Hydration | Habits | Aurora AI |
|-----------|-----------|--------|-----------|
| Health overview with daily insight | Animated water bottle tracker | Habit builder with streaks | Voice + text AI companion |

---

## ✨ Features

### Core Modules
- 💧 **Hydration Tracking** — Visual water bottle, quick-add buttons, daily logs
- 😴 **Sleep Logging** — Duration tracking, weekly trends, consistency scores
- 🔥 **Habit Builder** — Create, complete, and track daily habits with streaks
- 🥗 **Nutrition Awareness** — Log meals by type with calorie tracking
- 📊 **Smart Dashboard** — Unified health overview with personalized daily insight

### AI Companion (Aurora)
- 🎤 **Voice-to-Voice** — Speak naturally, receive spoken responses
- ⌨️ **Text Chat** — Full conversational interface with suggestion chips
- 🤖 **6 AI Agent Tools** — Aurora can take real actions through conversation:
  - `log_water` — Adds hydration from natural speech
  - `log_sleep` — Records sleep duration and quality
  - `create_habit` — Creates new habits on request
  - `complete_habit` — Marks habits done via conversation
  - `get_health_summary` — Fetches live stats for personalized responses
  - `log_nutrition` — Logs meals from natural descriptions
- 🧠 **Conversation Memory** — Maintains context across a session

### UX
- 🌙 Premium dark UI with Inter font throughout
- ✨ Smooth animations (orb pulse, water fill, progress rings)
- 🔐 Supabase Auth (Email + Google + Apple ready)
- 📲 3-step onboarding (Personal → Lifestyle → Goals)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 56 |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI Agent | Groq API (llama-3.3-70b-versatile) |
| Voice TTS | Expo Speech |
| Voice STT | Expo AV (Audio Recording) |
| Fonts | Google Inter |

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- Expo Go app on your phone (iOS or Android)
- Supabase account (free)
- Groq API key (free at console.groq.com)

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/aurora-health.git
cd aurora-health
```

---

### 2. Backend setup

```bash
cd aurora-backend
npm install
```

Create `.env`:
```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Start the backend:
```bash
node server.js
# ✅ Aurora backend running on port 3000
```

---

### 3. Frontend setup

```bash
cd aurora-app
npm install
```

Update `constants/api.ts` with your local IP:
```typescript
export const API_BASE = 'http://YOUR_LOCAL_IP:3000/api'
```

> Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

Start the app:
```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## 🗄️ Database Schema

```
profiles          → User profile + health goals
hydration_logs    → Water intake entries
sleep_logs        → Sleep duration + quality
habits            → User-created habits
habit_logs        → Daily habit completions
nutrition_logs    → Meal entries
health_memory     → AI observation memory
```

All tables use Row Level Security — users only access their own data.

---

## 🤖 AI Agent Architecture

```
User speaks/types
      ↓
Express /api/companion/chat
      ↓
runAuroraAgent()
      ↓
Groq LLM (llama-3.3-70b) decides which tool to call
      ↓
Tool executes → writes to Supabase
      ↓
Groq LLM generates warm confirmation response
      ↓
Response spoken aloud via Expo Speech
```

### Example interactions

```
User:  "I drank two glasses of water"
Tool:  log_water({ amount_ml: 500 })
Aurora: "Done! I've added 500ml to your hydration. You're now at 1,200ml — great progress!"

User:  "How am I doing today?"
Tool:  get_health_summary()
Aurora: "You've had 1,200ml of water, slept 7 hours, and completed 2 of 4 habits. Keep it up!"

User:  "Create a habit to read every evening"
Tool:  create_habit({ name: "Reading", time_of_day: "evening", icon: "📚" })
Aurora: "Done! I've added Reading to your evening habits. Consistency is everything!"
```

---

## 📁 Project Structure

```
aurora/
├── aurora-backend/
│   ├── agent/
│   │   ├── auroraAgent.js    ← LLM orchestration
│   │   └── tools.js          ← 6 AI tools
│   ├── routes/
│   │   ├── health.js         ← CRUD endpoints
│   │   ├── companion.js      ← AI chat endpoint
│   │   └── user.js           ← Profile endpoints
│   └── server.js
│
└── aurora-app/
    ├── app/
    │   ├── (auth)/           ← Welcome, Login, Signup
    │   ├── (onboarding)/     ← 3-step onboarding
    │   └── (tabs)/           ← Dashboard, Hydration, Habits, Companion, Profile
    ├── components/
    │   ├── companion/        ← VoiceOrb, ChatBubble
    │   └── ui/               ← Card, ProgressRing
    ├── store/                ← Zustand stores
    ├── lib/                  ← Supabase + API helpers
    └── constants/            ← Colors, API base URL
```

---

## 🏗️ Building the APK

```bash
cd aurora-app
npx expo install expo-dev-client
npx eas build --platform android --profile preview
```

Or for a local build:
```bash
npx expo run:android
```

---

## 👤 Author

Built for the Aurora Mobile Health Companion Hackathon.
