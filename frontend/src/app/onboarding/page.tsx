"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Search, Music, Mic2, Sparkles, UserCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const GENRES = [
  "Pop", "Hip-Hop", "R&B", "Indie Rock", "Electronic",
  "Classical", "Lofi Beats", "Jazz", "K-Pop", "Country",
  "Metal", "Folk", "Reggaeton", "Ambient", "Punk"
];

const MOCK_ARTISTS = [
  { id: "1", name: "The Weeknd", image: "https://images.unsplash.com/photo-1549834125-82d3c48159a3?w=400&q=80" },
  { id: "2", name: "Taylor Swift", image: "https://images.unsplash.com/photo-1493225457124-a1a2a4af3750?w=400&q=80" },
  { id: "3", name: "Kendrick Lamar", image: "https://images.unsplash.com/photo-1520635360276-79f3dbd809f6?w=400&q=80" },
  { id: "4", name: "Dua Lipa", image: "https://images.unsplash.com/photo-1516280440502-8610eb6bb2f1?w=400&q=80" },
  { id: "5", name: "Drake", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&q=80" },
  { id: "6", name: "Billie Eilish", image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&q=80" },
  { id: "7", name: "Post Malone", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
  { id: "8", name: "Ariana Grande", image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80" },
  { id: "9", name: "Bad Bunny", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" },
  { id: "10", name: "Frank Ocean", image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400&q=80" },
  { id: "11", name: "SZA", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80" },
  { id: "12", name: "Tyler, The Creator", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { id: "13", name: "Olivia Rodrigo", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
  { id: "14", name: "Harry Styles", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
  { id: "15", name: "J. Cole", image: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&q=80" }
];

const VIBES = [
  "Late Night Drive", "Deep Focus", "Gym Rat", "Sunday Morning",
  "Heartbreak", "Euphoria", "Nostalgia", "Party Mode"
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Form State
  const [profile, setProfile] = useState({ name: "", age: "" });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [artistSearch, setArtistSearch] = useState("");

  const supabase = createClient();

  const handleNext = () => setStep((s) => s + 1);
  const handleComplete = async () => {
    setStep(4);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      // 1. Update Profile
      await supabase
        .from("profiles")
        .update({ 
          display_name: profile.name,
          age_range: profile.age,
          has_completed_onboarding: true 
        })
        .eq("id", session.user.id);

      // 2. Insert Taste DNA
      await supabase
        .from("taste_dna")
        .insert({
          user_id: session.user.id,
          top_genres: selectedGenres,
          top_artists: selectedArtists,
          core_vibe: selectedVibes[0], // primary vibe
          energy_level: Math.floor(Math.random() * 40) + 60, // Mock calculation
          era_preference: "Nostalgic 2010s", // Mock calculation
          discovery_rate: Math.floor(Math.random() * 20) + 10 // Mock calculation
        });

      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save Taste DNA:", error);
      alert("Something went wrong saving your Taste DNA.");
      setStep(3); // Go back on error
    }
  };

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void, max: number) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else if (list.length < max) {
      setList([...list, item]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[60vh]">
      
      {/* Progress Bar (Hide on step 4) */}
      {step < 4 && (
        <div className="w-full max-w-md mx-auto mb-12 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <motion.div 
                className="h-full bg-[#FFB703]"
                initial={{ width: "0%" }}
                animate={{ width: step >= i ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* STEP 0: BASIC PROFILE */}
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center max-w-md mx-auto w-full"
          >
            <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center text-[#FFB703] mb-8 border border-gray-100">
              <UserCircle size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-4 text-center">Welcome to Resonance.</h1>
            <p className="text-gray-500 mb-10 text-center text-lg">Let's set up your listener profile.</p>

            <div className="w-full space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-[#FFB703] transition-colors"
                  placeholder="What should we call you?"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                  className="w-full bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-[#FFB703] transition-colors"
                  placeholder="e.g. 24"
                />
              </div>
            </div>

            <button 
              disabled={!profile.name || !profile.age}
              onClick={handleNext}
              className="mt-12 w-full flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Continue <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 1: GENRES */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Music size={32} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-4 text-center">What's your frequency?</h1>
            <p className="text-gray-500 mb-10 text-center text-lg">Select up to 5 genres you vibe with the most.</p>

            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres, 5)}
                    className={`px-6 py-3 rounded-full font-bold text-sm transition-all border-2 ${
                      isSelected 
                        ? "border-[#FFB703] bg-[#FFB703] text-[#1A1A1A] shadow-md scale-105" 
                        : "border-gray-200 bg-white text-gray-600 hover:border-[#FFB703]/50 hover:bg-[#FFB703]/5"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={selectedGenres.length === 0}
              onClick={handleNext}
              className="mt-12 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Next Step <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: ARTISTS */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Mic2 size={32} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-4 text-center">Who do you loop?</h1>
            <p className="text-gray-500 mb-8 text-center text-lg">Pick a few artists to anchor your Taste DNA.</p>

            <div className="relative w-full max-w-md mb-10">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                value={artistSearch}
                onChange={(e) => setArtistSearch(e.target.value)}
                placeholder="Search artists..." 
                className="w-full bg-white border-2 border-gray-100 rounded-full py-3 pl-12 pr-4 font-medium focus:outline-none focus:border-[#FFB703]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full h-[400px] overflow-y-auto scrollbar-hide px-4 pb-10">
              {MOCK_ARTISTS
                .filter(artist => artist.name.toLowerCase().includes(artistSearch.toLowerCase()))
                .map((artist) => {
                const isSelected = selectedArtists.includes(artist.id);
                return (
                  <div 
                    key={artist.id}
                    onClick={() => toggleSelection(artist.id, selectedArtists, setSelectedArtists, 10)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden transition-all duration-300 ${isSelected ? "ring-4 ring-[#FFB703] scale-105" : "group-hover:scale-105 group-hover:shadow-xl"}`}>
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                          <Check className="text-white w-10 h-10" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <span className={`font-bold text-sm text-center ${isSelected ? "text-[#1A1A1A]" : "text-gray-600"}`}>{artist.name}</span>
                  </div>
                );
              })}
              
              {MOCK_ARTISTS.filter(artist => artist.name.toLowerCase().includes(artistSearch.toLowerCase())).length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-10 font-medium">
                  No artists found. Try another search!
                </div>
              )}
            </div>

            <button 
              disabled={selectedArtists.length === 0}
              onClick={handleNext}
              className="mt-12 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              Next Step <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 3: VIBES */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-16 h-16 bg-white shadow-md rounded-full flex items-center justify-center text-[#FFB703] mb-6">
              <Sparkles size={32} />
            </div>
            <h1 className="text-4xl font-black text-[#1A1A1A] mb-4 text-center">The Final Vibe Check</h1>
            <p className="text-gray-500 mb-10 text-center text-lg">What moods define your everyday listening?</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
              {VIBES.map((vibe) => {
                const isSelected = selectedVibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    onClick={() => toggleSelection(vibe, selectedVibes, setSelectedVibes, 3)}
                    className={`aspect-[4/3] rounded-2xl flex items-center justify-center text-center p-4 font-bold text-sm transition-all border-2 ${
                      isSelected 
                        ? "border-[#FFB703] bg-[#FFB703] text-[#1A1A1A] shadow-lg scale-105" 
                        : "border-gray-200 bg-white text-gray-500 hover:border-[#FFB703]/50 hover:bg-[#FFB703]/5"
                    }`}
                  >
                    {vibe}
                  </button>
                );
              })}
            </div>

            <button 
              disabled={selectedVibes.length === 0}
              onClick={handleComplete}
              className="mt-12 flex items-center justify-center gap-3 bg-[#1A1A1A] text-white px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              Generate Taste DNA <Sparkles size={20} />
            </button>
          </motion.div>
        )}

        {/* STEP 4: LOADING */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full w-full"
          >
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-[#FFB703]/20 rounded-full"></div>
              <motion.div 
                className="absolute inset-0 border-4 border-[#FFB703] rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <DnaIcon className="w-12 h-12 text-[#1A1A1A] animate-pulse" />
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A] mb-2 text-center">Synthesizing DNA...</h1>
            <p className="text-gray-500 text-center font-medium animate-pulse">Mapping your sonic footprint across 50,000 data points.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
