<div align="center">
  <!-- Full-Screen Hero Banner -->
  <a href="https://resonancebyechostudio.netlify.app/" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/Niteshagarwal01/Resonance/blob/main/frontend/public/file_00000000dd687207ad89ca3d3bacb137.png?raw=true" alt="Resonance Banner" width="100%" style="max-width: 100%; display: block;" />
  </a>

  <!-- Full-Width Premium Navigation Bar -->
  <table width="100%" style="width: 100%; border-collapse: collapse; border: none; margin-top: 15px; font-family: system-ui, -apple-system, sans-serif;">
    <tr bgcolor="#1A1A1A" style="border: none;">
      <td align="center" style="padding: 14px; border: none; width: 25%;">
        <a href="https://resonancebyechostudio.netlify.app/" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #FFB703; font-weight: 800; font-size: 14px; letter-spacing: 0.5px;">
          🚀 LIVE DEMO
        </a>
      </td>
      <td align="center" style="padding: 14px; border: none; width: 25%;">
        <a href="https://github.com/Niteshagarwal01/Resonance/stargazers" style="text-decoration: none; color: #8ECAE6; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          ⭐ STARS
        </a>
      </td>
      <td align="center" style="padding: 14px; border: none; width: 25%;">
        <a href="https://github.com/Niteshagarwal01/Resonance/issues" style="text-decoration: none; color: #FB8500; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          🪲 ISSUES
        </a>
      </td>
      <td align="center" style="padding: 14px; border: none; width: 25%;">
        <a href="https://github.com/Niteshagarwal01/Resonance/blob/main/LICENSE" style="text-decoration: none; color: #219EBC; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
          📄 LICENSE
        </a>
      </td>
    </tr>
  </table>
</div>

---


> **Note**: Resonance utilizes the `ytmusicapi` to tap into the 100M+ song catalog of YouTube Music. No DRM. No premium subscriptions required. 100% open platform.

---

## 📖 Table of Contents

1. [Introduction & Vision](#-introduction--vision)
2. [The Core Philosophy](#-the-core-philosophy)
3. [Deep Dive: Key Features](#-deep-dive-key-features)
4. [UI & UX Design Principles](#-ui--ux-design-principles)
5. [System Architecture](#-system-architecture)
6. [Tech Stack](#-tech-stack)
7. [Getting Started (Local Development)](#-getting-started-local-development)
8. [Database Schema Overview](#-database-schema-overview)
9. [Deployment Guide](#-deployment-guide)
10. [Roadmap](#-roadmap)
11. [Contributing Guidelines](#-contributing-guidelines)
12. [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
13. [License & Acknowledgements](#-license--acknowledgements)

---

## 🌟 Introduction & Vision

Welcome to **Resonance**, a next-generation music streaming platform built entirely on open-source technologies. 

The modern music streaming landscape is fragmented, gated behind paywalls, and often lacks a true sense of community. Resonance was built with a singular vision: **to democratize music listening while offering an unapologetically premium, hyper-social experience.**

By leveraging the massive, unstructured catalog of YouTube Music (via `ytmusicapi`) and combining it with the realtime capabilities of Supabase and the blazing-fast rendering of Next.js 14, Resonance achieves what proprietary apps do—but it does it for free, openly, and beautifully.

---

## 🎯 The Core Philosophy

1. **Music is inherently social.** Listening shouldn't be an isolated activity. Resonance introduces Live Jam Sessions and Global Chat, turning passive listening into a shared, interactive experience.
2. **Algorithms should serve the user, not the platform.** Our "Taste DNA" system isn't a black box designed to push sponsored content. It's an evolving, transparent algorithm that learns your unique sonic identity based strictly on your interactions.
3. **Open source can be premium.** "Open source" doesn't have to mean "clunky." Resonance prioritizes design above all else, featuring fluid micro-animations, glassmorphism, and a meticulously crafted user interface.

---

## ✨ Deep Dive: Key Features

### 🧬 Taste DNA & Hyper-Personalization
When you first join Resonance, you undergo an interactive onboarding process to establish your "Taste DNA." 
- The algorithm captures your baseline preferences (Genres, Artists, Decades).
- As you listen, like tracks, and explore, your Taste DNA mutates in real-time.
- The dashboard dynamically generates **Vibe Mixes** (e.g., *Late Night Focus*, *Electric Energy*) tailored exclusively to your evolving algorithmic profile.

### 🌍 Massive Discover Engine
Finding new music should feel like an adventure. We've built a robust, horizontally-tabbed exploration system that fetches metadata seamlessly without overwhelming the API.
- **40+ Dynamic Shelves:** Explore categories ranging from *Underground Hip Hop* to *Viral TikTok Hits*.
- **Trending & New Releases:** Stay on top of the culture with real-time charts.
- **Mood & Genre Navigation:** Find the perfect soundtrack for your exact current mental state.

### 📻 Live Jam Sessions
Start a Jam Session and invite your friends (or the public) to listen along with you.
- **Realtime Playback Sync:** Powered by Supabase WebSockets, when the host pauses, skips, or scrubs the track, it syncs for everyone in the room instantly.
- **Collaborative Queueing:** Allow guests to add tracks to the upcoming queue.

### 💬 Ephemeral Global Chat
Discuss music drops, share links, and hang out in live community rooms.
- Messages are ephemeral and disappear after 24 hours, keeping the conversation focused on the *now*.

### ⚡ Infinite Auto-Play Radio
The music never stops. Our dynamic Radio algorithm uses the seed of your current track to fetch a massive queue of contextually aware, sonically similar songs. If you reach the end of a playlist, Resonance will seamlessly transition into Radio mode to keep the vibes going infinitely.

### 📚 Full Library Management
- **Playlists:** Create, edit, and share custom playlists. Upload custom cover art.
- **Liked Songs:** One-click save your favorite tracks.
- **Following:** Keep track of your favorite artists and get notified of their new releases.
- **History:** Never lose a track you loved; full chronological listening history.

---

## 🎨 UI & UX Design Principles

Resonance isn't just functional; it's designed to evoke emotion.

- **Glassmorphism:** Heavy use of translucent, frosted-glass backgrounds (`backdrop-blur`) that pick up the ambient colors of the underlying album art.
- **Fluid Typography:** Utilizing sleek sans-serif fonts with carefully calibrated tracking and leading to ensure maximum legibility across devices.
- **Micro-Animations:** Powered by `framer-motion`. Every interaction (hovering over a card, playing a track, opening a modal) is accompanied by a subtle, physics-based animation.
- **Responsive Layout:** A complex CSS Grid architecture ensures the massive vertical and horizontal shelves collapse gracefully from a 4K desktop monitor down to an iPhone Mini.

---

## 🏗️ System Architecture

Resonance uses a decoupled, hybrid architecture to ensure maximum performance and security.

### 1. The Frontend (Next.js 14 App Router)
The frontend is responsible for the UI, state management, and direct communication with the Supabase database for user-specific data (likes, playlists, chat). It uses React Context to manage the global audio player state, ensuring music continues playing seamlessly as you navigate between pages.

### 2. The Backend Bridge (Python FastAPI)
Because `ytmusicapi` is a Python library, we built a dedicated, lightning-fast FastAPI microservice. This backend acts as a proxy:
- It receives requests from the Next.js frontend (e.g., "Search for Drake", "Get stream URL for VideoID X").
- It queries YouTube Music, strips out the unnecessary metadata, and returns clean, strictly-typed JSON to the frontend.
- It resolves the complex, encrypted audio stream URLs into direct `<audio>` readable streams.

### 3. The Database (Supabase)
Supabase handles all persistent state.
- **PostgreSQL:** Stores user profiles, Taste DNA data, custom playlists, and listening history.
- **Row Level Security (RLS):** Ensures users can only modify their own data.
- **Realtime WebSockets:** Powers the Live Jam Sessions and Global Chat.

---

## 💻 Tech Stack

### Frontend (Client)
- **Framework:** Next.js 14 (App Router, Server Components)
- **Library:** React 18
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** React Context API (AudioPlayer Provider)
- **Data Fetching:** SWR / native `fetch`

### Backend (API)
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Music Data:** `ytmusicapi` (Unofficial YouTube Music API)
- **CORS Management:** FastAPI CORS Middleware

### Database / Auth
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Auth:** Supabase Auth (Email/Password, OAuth)
- **Realtime:** Supabase Realtime (WebSockets)

---

## 🚀 Getting Started (Local Development)

Follow these steps to get a local copy of Resonance up and running on your machine.

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js:** Version 18.x or higher
- **Python:** Version 3.9 or higher
- **Git:** Version control
- **Supabase Account:** A free tier project at [supabase.com](https://supabase.com)

### 1. Clone the repository
```bash
git clone https://github.com/Niteshagarwal01/Resonance.git
cd Resonance
```

### 2. Setup the Python Backend (FastAPI)
The backend is crucial as it serves all the music data.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (Highly recommended to avoid dependency conflicts)
python -m venv venv

# Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install the required Python packages
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```
*The backend should now be running at `http://127.0.0.1:8000`. Keep this terminal window open.*

### 3. Setup the Next.js Frontend
Open a **new** terminal window (leave the backend running) and navigate to the `frontend` folder.

```bash
cd frontend

# Install Node modules
npm install
```

### 4. Environment Variables
In the `frontend` directory, create a file named `.env.local`. You will need to grab your API keys from your Supabase Project Dashboard (Settings > API).

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key-here
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 5. Initialize the Database
Your Supabase PostgreSQL database needs the correct tables (Profiles, Playlists, etc.). We've provided a seed script in the backend.

First, create a `.env` file in your **`backend`** directory:
```env
# backend/.env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key-here
```

Then, run the seeder:
```bash
cd backend
python seed.py
```
*(Alternatively, you can manually run the SQL commands from the `migrations/` folder directly in your Supabase SQL Editor).*

### 6. Start the Development Server
With the database seeded and the Python backend running, start the Next.js app:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can now sign up, establish your Taste DNA, and start streaming!

---

## 🗄️ Database Schema Overview

For developers looking to understand how data is structured in Supabase, here is a high-level overview of our core tables:

- **`profiles`**: Stores user metadata (username, avatar_url, bio, created_at). Linked via foreign key to Supabase Auth's `auth.users`.
- **`taste_dna`**: Stores the user's algorithmic preferences. Includes JSONB columns for `top_genres`, `top_artists`, and `vibe_scores`.
- **`playlists`**: User-generated playlists. Contains `title`, `description`, `cover_image`, and an array of JSON objects representing `tracks`.
- **`liked_songs`**: A simple junction table mapping a `user_id` to a `track_id` (and caching basic track metadata to avoid unnecessary API hits).
- **`listening_history`**: Records every track a user plays, establishing a timestamp used to evolve the Taste DNA over time.
- **`chat_messages`**: Ephemeral table for global chat. A cron-job or trigger automatically deletes rows older than 24 hours.

---

## 🌐 Deployment Guide

Ready to show Resonance to the world? Here is the recommended deployment strategy.

### Deploying the Backend (Render / Railway / Heroku)
Because the backend is a Python FastAPI app, it cannot be hosted on Vercel/Netlify's edge network easily. We recommend **Render** or **Railway**.
1. Connect your GitHub repo to Render.
2. Create a new **Web Service**.
3. Set the Root Directory to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Once deployed, copy the live URL (e.g., `https://resonance-api.onrender.com`).

### Deploying the Frontend (Vercel / Netlify)
1. Connect your GitHub repo to Vercel or Netlify.
2. Set the Framework Preset to **Next.js**.
3. Set the Root Directory to `frontend`.
4. Add your Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (Set this to the live URL of your Python backend from the previous step).
5. Click **Deploy**.

---

## 🗺️ Roadmap

Resonance is constantly evolving. Here are some major features we are planning for the future:

- [ ] **Mobile App:** React Native port for iOS and Android.
- [ ] **Lyrics Integration:** Synchronized, real-time lyrics displaying along with the music.
- [ ] **AI DJ:** An LLM-powered virtual DJ that introduces tracks and tells you why they were selected for your Taste DNA.
- [ ] **Offline Mode:** Allowing Progressive Web App (PWA) caching of audio streams for offline listening.
- [ ] **Podcasts Integration:** Expanding the catalog beyond music into spoken-word content.
- [ ] **Advanced Equalizer:** A Web Audio API-powered 10-band graphic equalizer.

---

## 🤝 Contributing Guidelines

We welcome contributions from developers, designers, and music lovers of all skill levels! If you want to help make Resonance better, please follow these steps:

### 1. Find an Issue
Check out our [Issues](https://github.com/Niteshagarwal01/Resonance/issues) tab. Look for tags like `good first issue` or `help wanted`. If you have a completely new idea, open a discussion or a feature request issue first to ensure it aligns with the project's vision.

### 2. Fork and Clone
Fork the repository to your own GitHub account, then clone it locally:
```bash
git clone https://github.com/YOUR_USERNAME/Resonance.git
```

### 3. Create a Branch
Always branch off of `main` for your work. Use a descriptive naming convention:
```bash
git checkout -b feature/dark-mode-toggle
# or
git checkout -b fix/audio-player-bug
```

### 4. Make your Changes
Write clean, modular code. If you are modifying the UI, ensure it remains responsive and adheres to the existing glassmorphic aesthetic.
- **Linting:** Run `npm run lint` in the frontend directory before committing.
- **Formatting:** Ensure Python code adheres to PEP 8 standards.

### 5. Commit and Push
Use clear, descriptive commit messages.
```bash
git commit -m "feat: implemented real-time lyrics syncing"
git push origin feature/dark-mode-toggle
```

### 6. Open a Pull Request
Go to the original Resonance repository and open a PR. Provide a detailed description of what you changed, why you changed it, and include screenshots or screen recordings if your changes affect the UI.

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Is Resonance really free?**  
A: Yes. Because it uses the open `ytmusicapi` to tap into publicly available streams, there are no subscription fees, DRM restrictions, or paywalls.

**Q: Is it legal?**  
A: Resonance acts as a customized web browser that interacts with public endpoints. It does not host any copyrighted audio files itself. However, usage should comply with YouTube's terms of service.

**Q: Why separate the backend in Python instead of using Next.js API routes?**  
A: The Node.js ecosystem lacks a robust, fully-featured equivalent to the Python `ytmusicapi` library. By decoupling them, we get the best of both worlds: React/Next.js for the gorgeous UI, and Python for the heavy-lifting data scraping.

**Q: Can I import my Spotify/Apple Music playlists?**  
A: This feature is on our roadmap! In the future, we plan to implement a migration tool that matches your Spotify tracks to YouTube Music IDs automatically.

---

## 📸 Screenshots
*(Coming soon! Feel free to open a PR with high-quality screenshots of the app running locally!)*
<div align="center">
  <img src="https://raw.githubusercontent.com/Niteshagarwal01/Resonance/main/frontend/public/logofiles/favappicon.png" alt="App Icon" width="100" />
</div>

---

## ⚖️ License & Acknowledgements

Resonance is proudly open-sourced under the **MIT License**. You are free to use, modify, distribute, and commercialize the code, provided you include the original copyright and license notice. See the `LICENSE` file for more details.

### Acknowledgements
A massive thank you to:
- The maintainers of [ytmusicapi](https://github.com/sigma67/ytmusicapi) for their incredible library.
- [Supabase](https://supabase.com) for providing the ultimate open-source Firebase alternative.
- [Vercel](https://vercel.com) for creating Next.js and revolutionizing React development.
- The open-source community for the endless inspiration.

<div align="center">
  <br/>
  <p>Built with ❤️ by <a href="https://github.com/Niteshagarwal01">Niteshagarwal01</a> and contributors.</p>
  <img src="https://raw.githubusercontent.com/Niteshagarwal01/Resonance/main/frontend/public/logofiles/main-logo.png" alt="Resonance Footer" width="150" />
</div>
