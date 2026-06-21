"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Check, Search, Music, Mic2, Sparkles,
  UserCircle, Loader2, X, HeartIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { searchMusic, searchArtists } from "@/lib/api";

// --- STATIC DATA ---
const GENRES = [
  "Pop", "Hip-Hop", "R&B", "Indie Rock", "Electronic",
  "Classical", "Lofi Beats", "Jazz", "K-Pop", "Country",
  "Metal", "Folk", "Reggaeton", "Ambient", "Punk",
  "Dance", "Soul", "Gospel", "Afrobeats", "House"
];

const VIBES = [
  "Late Night Drive 🌙", "Deep Focus 🧠", "Gym Rat 💪", "Sunday Morning ☕",
  "Heartbreak 💔", "Euphoria ✨", "Nostalgia 📼", "Party Mode 🎉",
  "Chill Vibes 🌊", "Road Trip 🚗", "Study Session 📚", "Romance 💕"
];

// Debounce hook
function useDebounce(fn: (q: string) => void, delay = 450) {
  let timer: ReturnType<typeof setTimeout>;
  return (q: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(q), delay);
  };
}

type Artist = { id: string; name: string; image: string | null };
type Song   = { id: string; title: string; artist: string; thumbnail: string | null };

export default function OnboardingWizard() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(0);

  // Profile
  const [profile, setProfile] = useState({ name: "", age: "" });

  // Genres
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Artists - live search
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<Artist[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);

  // Songs - live search
  const [songQuery, setSongQuery] = useState("");
  const [songResults, setSongResults] = useState<Song[]>([]);
  const [songLoading, setSongLoading] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);

  // Vibes
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);

  // --- SEARCH HANDLERS ---
  const doArtistSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setArtistResults([]); return; }
    setArtistLoading(true);
    const res = await searchArtists(q);
    setArtistResults(res.filter((a: Artist) => a.id && a.name));
    setArtistLoading(false);
  }, []);

  const debouncedArtistSearch = useDebounce(doArtistSearch, 450);

  const doSongSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSongResults([]); return; }
    setSongLoading(true);
    const res = await searchMusic(q);
    setSongResults(res.filter((s: Song) => s.id && s.title));
    setSongLoading(false);
  }, []);

  const debouncedSongSearch = useDebounce(doSongSearch, 450);

  // --- TOGGLE HELPERS ---
  function toggleArtist(artist: Artist) {
    setSelectedArtists(prev =>
      prev.find(a => a.id === artist.id)
        ? prev.filter(a => a.id !== artist.id)
        : prev.length < 10 ? [...prev, artist] : prev
    );
  }

  function toggleSong(song: Song) {
    setSelectedSongs(prev =>
      prev.find(s => s.id === song.id)
        ? prev.filter(s => s.id !== song.id)
        : prev.length < 10 ? [...prev, song] : prev
    );
  }

  function toggleGenre(g: string) {
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev
    );
  }

  function toggleVibe(v: string) {
    setSelectedVibes(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 3 ? [...prev, v] : prev
    );
  }

  const handleNext = () => setStep(s => s + 1);

  const handleComplete = async () => {
    setStep(5);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      await supabase.from("profiles").update({
        display_name: profile.name,
        age_range: profile.age,
        has_completed_onboarding: true,
      }).eq("id", session.user.id);

      await supabase.from("taste_dna").upsert({
        user_id: session.user.id,
        top_genres: selectedGenres,
        top_artists: selectedArtists.map(a => a.name),
        top_songs: selectedSongs.map(s => ({ id: s.id, title: s.title, artist: s.artist })),
        core_vibe: selectedVibes[0] ?? null,
        energy_level: Math.floor(Math.random() * 40) + 60,
        era_preference: "Nostalgic 2010s",
        discovery_rate: Math.floor(Math.random() * 20) + 10,
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save Taste DNA:", err);
      alert("Something went wrong. Please try again.");
      setStep(4);
    }
  };

  // ── STEP LABELS ───────────────────────────────────────────────────────────
  const STEPS = ["Profile", "Genres", "Artists", "Songs", "Vibe"];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-10 px-4"
      style={{ background: "#FAFAF8" }}>

      {/* Header label */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 px-2">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Resonance</span>
        <span className="text-xs font-bold uppercase tracking-widest text-[#FFB703]">TASTE DNA SETUP</span>
      </div>

      {/* Progress bar */}
      {step < 5 && (
        <div className="w-full max-w-lg mx-auto mb-10 flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full bg-[#FFB703]"
                initial={{ width: "0%" }}
                animate={{ width: step > i ? "100%" : step === i ? "50%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── STEP 0: PROFILE ────────────────────────────────────────────────── */}
        {step === 0 && (
          <motion.div key="step0"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-md w-full">
            <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center text-[#FFB703] mb-8 border border-gray-100">
              <UserCircle size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3 text-center">Welcome to Resonance.</h1>
            <p className="text-gray-400 mb-10 text-center">Let's build your sonic identity. First, tell us about yourself.</p>
            <div className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Display Name</label>
                <input type="text" value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-[#FFB703] transition-colors"
                  placeholder="What should we call you?" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Age</label>
                <input type="number" value={profile.age}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-[#FFB703] transition-colors"
                  placeholder="e.g. 24" min={1} max={99} />
              </div>
            </div>
            <button disabled={!profile.name || !profile.age}
              onClick={handleNext}
              className="mt-10 w-full flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
              Continue <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 1: GENRES ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <motion.div key="step1"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-3xl">
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Music size={30} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3 text-center">What&apos;s your frequency?</h1>
            <p className="text-gray-400 mb-2 text-center">Pick up to <strong>5 genres</strong> you vibe with most.</p>
            <p className="text-xs text-gray-300 mb-8">{selectedGenres.length}/5 selected</p>
            <div className="flex flex-wrap justify-center gap-3">
              {GENRES.map(g => {
                const sel = selectedGenres.includes(g);
                return (
                  <button key={g} onClick={() => toggleGenre(g)}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all border-2 ${sel
                      ? "border-[#FFB703] bg-[#FFB703] text-[#1A1A1A] shadow-md scale-105"
                      : "border-gray-200 bg-white text-gray-600 hover:border-[#FFB703]/50"}`}>
                    {g}
                  </button>
                );
              })}
            </div>
            <button disabled={selectedGenres.length === 0} onClick={handleNext}
              className="mt-12 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
              Next Step <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: ARTISTS (LIVE SEARCH) ──────────────────────────────────── */}
        {step === 2 && (
          <motion.div key="step2"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-3xl">
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Mic2 size={30} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3 text-center">Who do you loop?</h1>
            <p className="text-gray-400 mb-2 text-center">Search and pick up to <strong>10 artists</strong> you love.</p>
            <p className="text-xs text-gray-300 mb-6">{selectedArtists.length}/10 selected</p>

            {/* Selected Chips */}
            {selectedArtists.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {selectedArtists.map(a => (
                  <span key={a.id} className="flex items-center gap-2 bg-[#FFB703]/15 border border-[#FFB703]/40 text-[#1A1A1A] text-sm font-bold px-4 py-2 rounded-full">
                    {a.image && <img src={a.image} alt={a.name} className="w-6 h-6 rounded-full object-cover" />}
                    {a.name}
                    <X size={14} className="cursor-pointer opacity-60 hover:opacity-100" onClick={() => toggleArtist(a)} />
                  </span>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div className="relative w-full max-w-lg mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              {artistLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFB703] animate-spin" size={18} />}
              <input type="text" value={artistQuery}
                onChange={e => { setArtistQuery(e.target.value); debouncedArtistSearch(e.target.value); }}
                placeholder="Search any artist — The Weeknd, Aditya Kumar, AR Rahman..."
                className="w-full bg-white border-2 border-gray-100 shadow-sm rounded-full py-4 pl-12 pr-12 font-medium focus:outline-none focus:border-[#FFB703] transition-colors" />
            </div>

            {/* Results Grid */}
            {artistResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 w-full max-h-96 overflow-y-auto scrollbar-hide pb-4">
                {artistResults.map(artist => {
                  const sel = selectedArtists.find(a => a.id === artist.id);
                  return (
                    <div key={artist.id} onClick={() => toggleArtist(artist)}
                      className="flex flex-col items-center gap-3 cursor-pointer group">
                      <div className={`relative w-28 h-28 rounded-full overflow-hidden transition-all duration-300 border-4 ${sel ? "border-[#FFB703] scale-105 shadow-lg shadow-[#FFB703]/20" : "border-transparent group-hover:scale-105 group-hover:shadow-xl"}`}>
                        {artist.image
                          ? <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><Mic2 size={36} /></div>
                        }
                        {sel && (
                          <div className="absolute inset-0 bg-[#FFB703]/30 flex items-center justify-center">
                            <Check className="text-white drop-shadow" size={32} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <span className={`font-bold text-sm text-center line-clamp-2 ${sel ? "text-[#1A1A1A]" : "text-gray-500"}`}>{artist.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : artistQuery && !artistLoading ? (
              <p className="text-gray-400 text-sm mt-4">No artists found for &quot;{artistQuery}&quot;. Try a different name.</p>
            ) : !artistQuery ? (
              <p className="text-gray-300 text-sm mt-4">Start typing to search millions of artists...</p>
            ) : null}

            <button disabled={selectedArtists.length === 0} onClick={handleNext}
              className="mt-10 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
              Next Step <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 3: FAV SONGS (LIVE SEARCH) ────────────────────────────────── */}
        {step === 3 && (
          <motion.div key="step3"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-3xl">
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <HeartIcon size={30} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3 text-center">Your all-time bangers?</h1>
            <p className="text-gray-400 mb-2 text-center">Search and pick up to <strong>10 songs</strong> that define you.</p>
            <p className="text-xs text-gray-300 mb-6">{selectedSongs.length}/10 selected</p>

            {/* Selected Song Chips */}
            {selectedSongs.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                {selectedSongs.map(s => (
                  <span key={s.id} className="flex items-center gap-2 bg-[#FFB703]/15 border border-[#FFB703]/40 text-[#1A1A1A] text-sm font-bold px-4 py-2 rounded-full max-w-[220px]">
                    <span className="truncate">{s.title}</span>
                    <X size={14} className="cursor-pointer opacity-60 hover:opacity-100 shrink-0" onClick={() => toggleSong(s)} />
                  </span>
                ))}
              </div>
            )}

            {/* Search Bar */}
            <div className="relative w-full max-w-lg mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              {songLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFB703] animate-spin" size={18} />}
              <input type="text" value={songQuery}
                onChange={e => { setSongQuery(e.target.value); debouncedSongSearch(e.target.value); }}
                placeholder="Search any song — Blinding Lights, Levitating..."
                className="w-full bg-white border-2 border-gray-100 shadow-sm rounded-full py-4 pl-12 pr-12 font-medium focus:outline-none focus:border-[#FFB703] transition-colors" />
            </div>

            {/* Song Results List */}
            {songResults.length > 0 ? (
              <div className="w-full max-h-96 overflow-y-auto scrollbar-hide space-y-2 pb-4">
                {songResults.map(song => {
                  const sel = selectedSongs.find(s => s.id === song.id);
                  return (
                    <div key={song.id} onClick={() => toggleSong(song)}
                      className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${sel ? "bg-[#FFB703]/10 border-2 border-[#FFB703]" : "bg-white border-2 border-transparent hover:border-gray-200 hover:shadow-sm"}`}>
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {song.thumbnail
                          ? <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Music size={24} /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#1A1A1A] truncate">{song.title}</p>
                        <p className="text-sm text-gray-400 truncate">{song.artist}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${sel ? "bg-[#FFB703]" : "bg-gray-100"}`}>
                        {sel ? <Check size={16} className="text-[#1A1A1A]" strokeWidth={3} /> : <span className="text-gray-400 text-lg">+</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : songQuery && !songLoading ? (
              <p className="text-gray-400 text-sm mt-4">No songs found for &quot;{songQuery}&quot;. Try a different title.</p>
            ) : !songQuery ? (
              <p className="text-gray-300 text-sm mt-4">Start typing to search millions of songs...</p>
            ) : null}

            <button disabled={selectedSongs.length === 0} onClick={handleNext}
              className="mt-10 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
              Next Step <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 4: VIBES ──────────────────────────────────────────────────── */}
        {step === 4 && (
          <motion.div key="step4"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-3xl">
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Sparkles size={30} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-3 text-center">The Final Vibe Check</h1>
            <p className="text-gray-400 mb-2 text-center">Pick up to <strong>3 moods</strong> that define your everyday listening.</p>
            <p className="text-xs text-gray-300 mb-10">{selectedVibes.length}/3 selected</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
              {VIBES.map(v => {
                const sel = selectedVibes.includes(v);
                return (
                  <button key={v} onClick={() => toggleVibe(v)}
                    className={`py-5 px-4 rounded-2xl flex items-center justify-center text-center font-bold text-sm transition-all border-2 ${sel
                      ? "border-[#FFB703] bg-[#FFB703] text-[#1A1A1A] shadow-lg scale-105"
                      : "border-gray-200 bg-white text-gray-500 hover:border-[#FFB703]/50"}`}>
                    {v}
                  </button>
                );
              })}
            </div>
            <button disabled={selectedVibes.length === 0} onClick={handleComplete}
              className="mt-12 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-12 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
              Build My Taste DNA <Sparkles size={20} />
            </button>
          </motion.div>
        )}

        {/* ── STEP 5: LOADING / COMPLETE ─────────────────────────────────────── */}
        {step === 5 && (
          <motion.div key="step5"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
            <h2 className="text-3xl font-black text-[#1A1A1A]">Calibrating your Taste DNA...</h2>
            <p className="text-gray-400 max-w-sm">Weaving your genres, artists, songs and vibes into your personal sonic identity.</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
