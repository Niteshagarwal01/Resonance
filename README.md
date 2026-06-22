<div align="center">
  <img src="https://raw.githubusercontent.com/Niteshagarwal01/Resonance/main/frontend/public/icon.png" alt="Resonance Logo" width="120" height="120" />
  
  <h1 align="center">Resonance</h1>
  <p align="center">
    <strong>An open-source, beautifully designed social music player built with Next.js & Supabase.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/Niteshagarwal01/Resonance"><img src="https://img.shields.io/github/stars/Niteshagarwal01/Resonance?style=for-the-badge&color=FFB703" alt="Stars" /></a>
    <a href="https://github.com/Niteshagarwal01/Resonance/network/members"><img src="https://img.shields.io/github/forks/Niteshagarwal01/Resonance?style=for-the-badge&color=8ECAE6" alt="Forks" /></a>
    <a href="https://github.com/Niteshagarwal01/Resonance/issues"><img src="https://img.shields.io/github/issues/Niteshagarwal01/Resonance?style=for-the-badge&color=FB8500" alt="Issues" /></a>
  </p>
</div>

<br />

> **Note**: Resonance utilizes `ytmusicapi` to tap into the 100M+ song catalog of YouTube Music. No DRM. No premium subscriptions required. 100% open platform.

## ✨ Features

- 🧬 **Taste DNA:** An evolving algorithm that learns your sonic identity based on your listening history and dynamically generates personalized *Vibe Mixes*.
- 📻 **Live Jam Sessions:** Host or join live music rooms. Sync playback state in real-time with other users via Supabase WebSockets. Like Discord's "Listening Party".
- 💬 **Ephemeral Global Chat:** Discuss music drops in live community rooms. Messages disappear after 24 hours.
- 🎨 **Extremely Premium UI:** Built with TailwindCSS and Framer Motion for a fluid, glassmorphic, micro-animated user experience.
- 📚 **Full Library Management:** Create custom playlists, like songs, and track your listening history. 

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime WebSockets).
- **Music API:** Custom Node.js bridge using `ytmusicapi` to stream audio securely and fetch metadata without API keys.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free Supabase project
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Niteshagarwal01/Resonance.git
   cd Resonance
   ```

2. **Setup the Backend Services**
   Navigate to the `backend` folder to start the YouTube Music API wrapper:
   ```bash
   cd backend
   npm install
   npm run start
   ```

3. **Setup the Frontend**
   Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Variables**
   Create a `.env.local` file in the `frontend` directory and add your Supabase keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the Migrations**
   Copy the SQL scripts located in `backend/migrations/` and run them in your Supabase SQL Editor to create the required tables (`profiles`, `taste_dna`, `playlists`, `chat_messages`, etc).

6. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view Resonance in your browser.

## 🤝 Contributing
Resonance is open-source and built for the community. Contributions, issues, and feature requests are always welcome! 

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is open-sourced under the MIT License. See the `LICENSE` file for more details.

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Niteshagarwal01">Niteshagarwal01</a> and contributors.</p>
</div>
