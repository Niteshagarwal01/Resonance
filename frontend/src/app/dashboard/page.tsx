"use client";

import { useState, useEffect } from "react";
import { searchMusic, Track } from "@/lib/api";
import { usePlayer } from "@/context/PlayerContext";
import Image from "next/image";
import { Play, Sparkles, TrendingUp, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function DashboardHome() {
  const [dailyPicks, setDailyPicks] = useState<Track[]>([]);
  const [trending, setTrending] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [dna, setDna] = useState<any>(null);
  const { playTrack } = usePlayer();
  const supabase = createClient();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setBackendError(false);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let userDna = null;
        if (session) {
          const { data } = await supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single();
          userDna = data;
          setDna(data);
        }

        const vibeQuery = userDna?.core_vibe ? `${userDna.core_vibe} mix` : "Lofi chill beats";
        const trendQuery = userDna?.top_genres?.[0] ? `top global ${userDna.top_genres[0]}` : "Top global pop 2024";

        const [picks, trend] = await Promise.all([
          searchMusic(vibeQuery),
          searchMusic(trendQuery)
        ]);
        
        if (picks.length === 0 && trend.length === 0) {
          setBackendError(true);
        } else {
          setDailyPicks(picks.slice(0, 5));
          setTrending(trend.slice(0, 10));
        }
      } catch (error) {
        console.error("Failed to load initial tracks", error);
        setBackendError(true);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [supabase]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  if (backendError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Radio size={40} />
        </div>
        <h2 className="text-3xl font-black text-[#1A1A1A] mb-4">Backend API Offline</h2>
        <p className="text-gray-500 max-w-md">
          The Resonance frontend is running, but it cannot connect to the Python backend on port 8000. 
          Please start the FastAPI server to fetch real YouTube Music data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-10">
      <header className="mb-10 relative">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] mb-2">
            Good Evening<span className="text-[#FFB703]">.</span>
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <Sparkles size={16} className="text-[#8ECAE6]" />
            Your Taste DNA is evolving. Here is your daily resonance.
          </p>
        </motion.div>
      </header>

      {/* Hero Section: Taste DNA Highlight */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="mb-12 relative overflow-hidden rounded-[2rem] bg-[#1A1A1A] p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFB703] rounded-full mix-blend-screen filter blur-[120px] opacity-40 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8ECAE6] rounded-full mix-blend-screen filter blur-[100px] opacity-30 -translate-x-1/3 translate-y-1/3"></div>
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-wider uppercase mb-6 text-[#FFB703]">
              <DnaIcon className="w-3 h-3" />
              Taste DNA Match
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight capitalize">
              {dna?.core_vibe ? dna.core_vibe.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() : "Lofi Chill"}<br />Atmospheric Vibes
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-md mb-8 leading-relaxed">
              Based on your recent deep dives into {dna?.top_genres?.[0] || "ambient electronic"} and {dna?.top_genres?.[1] || "acoustic indie"}, we've compiled a 2-hour seamless journey.
            </p>
            
            <button 
              className="group flex items-center gap-3 bg-white text-[#1A1A1A] px-6 py-3.5 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(255,255,255,0.15)]"
              onClick={() => dailyPicks.length > 0 && playTrack(dailyPicks[0], dailyPicks)}
            >
              <div className="w-8 h-8 rounded-full bg-[#FFB703] flex items-center justify-center">
                <Play size={16} fill="currentColor" className="ml-1" />
              </div>
              Play Mix
            </button>
          </div>

          <div className="w-full md:w-1/3 aspect-square relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse"></div>
            ) : dailyPicks[0]?.thumbnail ? (
              <Image src={dailyPicks[0].thumbnail} alt="Cover" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#FFB703] to-[#8ECAE6] opacity-80"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 to-transparent"></div>
          </div>
        </div>
      </motion.section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-[#1A1A1A]" />
          <h2 className="text-2xl font-black text-[#1A1A1A]">Trending in your Network</h2>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse"></div>
                <div className="w-3/4 h-4 bg-gray-100 rounded-full animate-pulse"></div>
                <div className="w-1/2 h-3 bg-gray-100 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {trending.map((track) => (
              <motion.div 
                key={track.id}
                variants={itemVariants}
                className="group relative bg-[#FDFBF7] border border-gray-100 rounded-2xl p-4 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
                onClick={() => playTrack(track, trending)}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-4 bg-gray-100 shadow-sm">
                  {track.thumbnail ? (
                    <Image src={track.thumbnail} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-full bg-[#FFB703] text-[#1A1A1A] flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <Play size={24} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                
                <h3 className="font-bold text-[#1A1A1A] text-sm truncate">{track.title}</h3>
                <p className="text-xs text-gray-500 font-medium truncate mt-1">{track.artist}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

// Simple DNA Icon SVG component since lucide doesn't have a perfect one
function DnaIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.808-5.993" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.808 5.993" />
      <path d="m17 4-2.5 2.5" />
      <path d="m14 8-1.5 1.5" />
      <path d="m7 20 2.5-2.5" />
      <path d="m10 16 1.5-1.5" />
    </svg>
  );
}
