<div align="center">
  <img src="frontend/public/logofiles/main-logo.png" alt="Resonance Logo" width="350" />
  
  <h1 align="center">Resonance</h1>
  <p align="center">
    <strong>An open-source, beautifully designed social music player powered by YouTube Music & Supabase.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/Niteshagarwal01/Resonance"><img src="https://img.shields.io/github/stars/Niteshagarwal01/Resonance?style=for-the-badge&color=FFB703" alt="Stars" /></a>
    <a href="https://github.com/Niteshagarwal01/Resonance/network/members"><img src="https://img.shields.io/github/forks/Niteshagarwal01/Resonance?style=for-the-badge&color=8ECAE6" alt="Forks" /></a>
    <a href="https://github.com/Niteshagarwal01/Resonance/issues"><img src="https://img.shields.io/github/issues/Niteshagarwal01/Resonance?style=for-the-badge&color=FB8500" alt="Issues" /></a>
  </p>
</div>

<br />

> **Note**: Resonance utilizes the `ytmusicapi` to tap into the 100M+ song catalog of YouTube Music. No DRM. No premium subscriptions required. 100% open platform.

## ✨ Key Features

- 🧬 **Taste DNA & Hyper-Personalization:** An evolving algorithm that learns your sonic identity based on your onboarding choices and listening history, instantly curating your dashboard to your unique vibe.
- 🌍 **Massive Discover Engine:** A robust, tabbed exploration system featuring 40+ dynamic shelves (from *Underground Hip Hop* to *Viral TikTok Hits*) designed to help you find your next obsession.
- 📻 **Live Jam Sessions & Community:** Host or join live music rooms. Sync playback state in real-time with other users via Supabase WebSockets. Share tracks and chat globally.
- 🎨 **Extremely Premium UI:** Built with TailwindCSS and Framer Motion for a fluid, glassmorphic, micro-animated user experience. Massive horizontal shelves, glowing shadows, and seamless routing.
- 📚 **Full Library Management:** Create custom playlists, like songs, follow artists, and track your listening history.
- ⚡ **Infinite Auto-Play:** The music never stops. Our dynamic Radio algorithm fetches context-aware tracks infinitely based on the current song's seed.

---

## 📸 Screenshots
*(Coming soon! Feel free to open a PR with high-quality screenshots of the app running locally!)*
<div align="center">
  <img src="frontend/public/logofiles/favappicon.png" alt="App Icon" width="100" />
</div>

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** Next.js 14 (App Router)
- **Library:** React 18
- **Styling:** Tailwind CSS + Framer Motion
- **Icons:** Lucide React

### Backend (API)
- **Framework:** Python FastAPI
- **Music Data:** `ytmusicapi` (Python library for YouTube Music)
- **Database / Auth:** Supabase (PostgreSQL, Row Level Security, WebSockets)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- A free [Supabase](https://supabase.com) project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Niteshagarwal01/Resonance.git
   cd Resonance
   ```

2. **Setup the Python Backend (FastAPI)**
   The backend acts as a bridge to securely stream audio and fetch metadata from YouTube Music.
   ```bash
   cd backend
   
   # Create a virtual environment (optional but recommended)
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the FastAPI server
   uvicorn main:app --reload --port 8000
   ```

3. **Setup the Next.js Frontend**
   Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env.local` file in the `frontend` directory and add your Supabase credentials, as well as the local API URL:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
   ```

5. **Run the Database Migrations**
   You can push the database schema to your Supabase project by copying the SQL files (if available) into the Supabase SQL Editor, or by running:
   ```bash
   cd backend
   python seed.py
   ```
   *(Ensure you have configured your database connection strings in the backend `.env` file first if using scripts).*

6. **Start the Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view Resonance in your browser!

---

## 🤝 Contributing
Resonance is open-source and built for the community. Contributions, issues, and feature requests are always welcome! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is open-sourced under the MIT License. See the `LICENSE` file for more details.

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Niteshagarwal01">Niteshagarwal01</a> and contributors.</p>
</div>
