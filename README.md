

# 🚨 CRISES COMPASS

**Real-time Crisis Intelligence & Response Platform**

> Turning chaos into coordinated action using AI + real-time data + interactive mapping.

---

## 🌍 Problem

During emergencies (natural disasters, accidents, urban crises), information is:

* Scattered
* Delayed
* Unverified

This leads to:

* Slow response times
* Poor coordination
* Increased casualties

---

## 💡 Solution

**Crises Compass** is a real-time crisis management platform that:

* 📍 Maps incidents live on an interactive dashboard
* 🤖 Provides AI-powered emergency guidance
* 📊 Visualizes impact metrics for decision-makers
* 🧭 Enables coordinated response via a command center

---

## ✨ Key Features

### 🗺️ Live Crisis Map

* Real-time incident visualization using Mapbox GL JS
* Location-based alerts and updates
* Interactive markers with details

---

### 🤖 AI Emergency Assistant

Powered by OpenAI API

* Instant guidance during emergencies
* Context-aware responses
* Helps users make critical decisions fast

---

### 🧑‍🚒 Command Center Dashboard

* Centralized control interface
* Live stats & metrics
* Incident tracking and prioritization

---

### 📊 Impact Analytics

* Real-time data insights
* Visual dashboards
* Helps authorities allocate resources effectively

---

### 🧪 Demo Mode (Hackathon Ready)

* Preloaded data
* Fully functional without backend setup
* Perfect for live judging demos

---

## 🛠️ Tech Stack

| Layer      | Technology       |
| ---------- | ---------------- |
| Frontend   | React + Vite     |
| Styling    | Tailwind CSS     |
| Backend    | Supabase         |
| Maps       | Mapbox GL JS     |
| AI         | OpenAI API       |
| Deployment | Vercel / Netlify |

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/crises-compass.git
cd crises-compass
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

---

### 4. Run the app

```bash
npm run dev
```

---

### 5. Open in browser

```
http://localhost:5173
```

---

## 🎯 Demo Guide (For Judges)

1. Open the platform
2. Enable **Demo Mode**
3. Explore:

   * 📍 Live Map → view incidents
   * 🤖 AI Assistant → ask emergency questions
   * 📊 Dashboard → see analytics
   * 🧭 Command Center → simulate coordination

---

## 🧠 Architecture Overview

```
User → React Frontend → Supabase (DB/Auth)
                      → OpenAI (AI Assistant)
                      → Mapbox (Geospatial UI)
```

---

## 🚀 What Makes This Special

* Combines **AI + geospatial intelligence**
* Designed for **real-world emergency use**
* Fully interactive + scalable architecture
* Built with **demo-first mindset for hackathons**

---

## ⚠️ Limitations (Honest + Smart)

* Requires API keys for full functionality
* AI responses depend on external API availability
* Real-time data currently simulated in demo mode

---

## 🔮 Future Improvements

* Live government / IoT data integration
* SMS & offline emergency alerts
* Multi-language AI support
* Mobile app version

---

## 👥 Team

Built during a hackathon with a focus on:

* Speed ⚡
* Impact 🌍
* Real-world usability 🧭

---

## 📄 License

MIT License

---

## ❤️ Final Note

> In a crisis, minutes matter.
> **Crises Compass helps people act faster, smarter, and together 

