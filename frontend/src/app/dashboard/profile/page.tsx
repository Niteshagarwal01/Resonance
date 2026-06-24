"use client";

import { UserCircle, Settings, Edit3, Shield, LogOut, Sparkles, X, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { searchMusic, searchArtists } from "@/lib/api";

const GENRES = [
  "Bollywood Pop", "Punjabi Pop", "English Pop", "K-Pop", "Indie Pop",
  "DHH", "Indian Rap", "Trap", "Drill", "Conscious Rap",
  "EDM", "House", "Techno", "Future Bass", "Lo-Fi",
  "Telugu", "Tamil", "Malayalam", "Kannada", "Marathi", "Bengali", "Bhojpuri", "Haryanvi",
  "Rock", "Metal", "Indie Rock", "Alternative",
  "R&B", "Sufi", "Ghazal", "Acoustic",
  "Devotional", "Classical", "Folk"
];

const VIBES = [
  "Late Night Drive 🌙", "Deep Focus 🧠", "Gym Rat 💪", "Sunday Morning ☕",
  "Heartbreak 💔", "Euphoria ✨", "Nostalgia 📼", "Party Mode 🎉",
  "Chill Vibes 🌊", "Road Trip 🚗", "Study Session 📚", "Romance 💕"
];

function useDebounce(fn: (q: string) => void, delay = 450) {
  let timer: ReturnType<typeof setTimeout>;
  return (q: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(q), delay);
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [tasteDna, setTasteDna] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Taste DNA State
  const [dnaArtists, setDnaArtists] = useState<any[]>([]);
  const [dnaSongs, setDnaSongs] = useState<any[]>([]);
  const [dnaGenres, setDnaGenres] = useState<string[]>([]);
  const [dnaVibes, setDnaVibes] = useState<string[]>([]);

  // Search State
  const [artistQuery, setArtistQuery] = useState("");
  const [artistResults, setArtistResults] = useState<any[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);
  
  const [songQuery, setSongQuery] = useState("");
  const [songResults, setSongResults] = useState<any[]>([]);
  const [songLoading, setSongLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const [profileRes, dnaRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase.from("taste_dna").select("*").eq("user_id", session.user.id).single()
        ]);
        
        if (profileRes.data) setProfile(profileRes.data);
        if (dnaRes.data) {
          setTasteDna(dnaRes.data);
          // Convert legacy strings to objects if necessary, though UI expects objects
          const artists = (dnaRes.data.top_artists || []).map((a: any) => typeof a === 'string' ? { id: `legacy-${a}`, name: a, image: null } : a);
          setDnaArtists(artists);
          setDnaSongs(dnaRes.data.top_songs || []);
          
          // Filter out legacy genres that no longer exist in our new GENRES list
          // so they don't invisibly count towards the 5-genre limit.
          const validGenres = (dnaRes.data.top_genres || []).filter((g: string) => GENRES.includes(g));
          setDnaGenres(validGenres);
          
          setDnaVibes(dnaRes.data.core_vibe ? [dnaRes.data.core_vibe] : []);
        }
      }
    }
    loadData();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push("/login");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      if (activeTab === 'dna') {
        if (tasteDna?.id) {
          // Update existing Taste DNA
          const { error } = await supabase.from("taste_dna").update({
            top_genres: dnaGenres,
            top_artists: dnaArtists,
            top_songs: dnaSongs,
            core_vibe: dnaVibes[0] || null,
          }).eq("id", tasteDna.id);
          if (error) throw error;
        } else {
          // Create new Taste DNA
          const { error } = await supabase.from("taste_dna").insert({
            user_id: session.user.id,
            top_genres: dnaGenres,
            top_artists: dnaArtists,
            top_songs: dnaSongs,
            core_vibe: dnaVibes[0] || null,
          });
          if (error) throw error;
        }
      }

      setToast({ message: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to save settings.', type: 'error' });
      setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
    } finally {
      setSaving(false);
    }
  };

  // --- Search Handlers ---
  const doArtistSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setArtistResults([]); return; }
    setArtistLoading(true);
    try {
      const res = await searchArtists(q);
      setArtistResults(res.filter((a: any) => a.id && a.name));
    } finally { setArtistLoading(false); }
  }, []);
  const debouncedArtistSearch = useDebounce(doArtistSearch, 450);

  const doSongSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setSongResults([]); return; }
    setSongLoading(true);
    try {
      const res = await searchMusic(q);
      setSongResults(res.filter((s: any) => s.id && s.title).map((s:any) => ({ id: s.id, title: s.title, artist: s.artist, thumbnail: s.thumbnail })));
    } finally { setSongLoading(false); }
  }, []);
  const debouncedSongSearch = useDebounce(doSongSearch, 450);

  return (
    <div className="p-8 pb-32 max-w-4xl mx-auto">
      
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-16">
        <div className="w-40 h-40 bg-gray-100 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-gray-400 relative overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <UserCircle size={80} strokeWidth={1} />
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-black text-[#1A1A1A] mb-2">
            {profile?.display_name || "Guest Listener"}
          </h1>
          <p className="text-gray-500 font-medium">
            Age Group: {profile?.age_range || "Unknown"}
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div onClick={() => setActiveTab('dna')} className={`bg-white p-6 rounded-3xl border shadow-sm cursor-pointer transition-colors ${activeTab === 'dna' ? 'border-[#FFB703] ring-2 ring-[#FFB703]/20' : 'border-gray-100 hover:border-[#FFB703]'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${activeTab === 'dna' ? 'bg-[#FFB703] text-[#1A1A1A]' : 'bg-orange-50 text-orange-500'}`}>
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Taste DNA</h3>
          <p className="text-sm text-gray-500">Manage your favorite artists, songs, and vibes.</p>
        </div>

        <div onClick={() => setActiveTab('settings')} className={`bg-white p-6 rounded-3xl border shadow-sm cursor-pointer transition-colors ${activeTab === 'settings' ? 'border-[#FFB703] ring-2 ring-[#FFB703]/20' : 'border-gray-100 hover:border-[#FFB703]'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${activeTab === 'settings' ? 'bg-[#FFB703] text-white' : 'bg-gray-50 text-gray-600'}`}>
            <Settings size={20} />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Account</h3>
          <p className="text-sm text-gray-500">Manage your display name and profile settings.</p>
        </div>

        <div onClick={handleLogout} className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm cursor-pointer hover:border-red-300 transition-colors group">
          <div className="w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LogOut size={20} />
          </div>
          <h3 className="text-lg font-bold text-red-600 mb-1">Log Out</h3>
          <p className="text-sm text-red-400">Clear your session.</p>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab && (
        <div className="mt-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-[#1A1A1A] capitalize">{activeTab === 'dna' ? 'Taste DNA Editor' : 'Account Settings'}</h2>
            <button onClick={() => setActiveTab(null)} className="text-gray-400 hover:text-[#1A1A1A]"><X size={24} /></button>
          </div>
          
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                <input type="text" defaultValue={profile?.display_name || ''} className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#FFB703]" />
              </div>
            </div>
          )}

          {activeTab === 'dna' && (
            <div className="space-y-12">
              {/* Artists Section */}
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Favorite Artists</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dnaArtists.map((a: any) => (
                    <span key={a.id || a.name} className="flex items-center gap-2 bg-gray-100 text-[#1A1A1A] text-sm font-medium px-3 py-1.5 rounded-full">
                      {a.name}
                      <X size={14} className="cursor-pointer opacity-60 hover:opacity-100 text-red-500" onClick={() => setDnaArtists(prev => prev.filter(x => x !== a))} />
                    </span>
                  ))}
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  {artistLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFB703] animate-spin" size={14} />}
                  <input type="text" value={artistQuery} onChange={e => { setArtistQuery(e.target.value); debouncedArtistSearch(e.target.value); }} placeholder="Search to add artist..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-[#FFB703]" />
                </div>
                {artistResults.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {artistResults.map(a => (
                      <div key={a.id} onClick={() => { if (!dnaArtists.find(x => x.id === a.id)) setDnaArtists([...dnaArtists, a]); setArtistQuery(""); setArtistResults([]); }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100">
                        {a.image && <img src={a.image} className="w-8 h-8 rounded-full object-cover" alt="" />}
                        <span className="text-xs font-bold truncate">{a.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Songs Section */}
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Top Songs</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dnaSongs.map((s: any) => (
                    <span key={s.id} className="flex items-center gap-2 bg-gray-100 text-[#1A1A1A] text-sm font-medium px-3 py-1.5 rounded-full max-w-[200px]">
                      <span className="truncate">{s.title}</span>
                      <X size={14} className="cursor-pointer opacity-60 hover:opacity-100 text-red-500 shrink-0" onClick={() => setDnaSongs(prev => prev.filter(x => x.id !== s.id))} />
                    </span>
                  ))}
                </div>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  {songLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FFB703] animate-spin" size={14} />}
                  <input type="text" value={songQuery} onChange={e => { setSongQuery(e.target.value); debouncedSongSearch(e.target.value); }} placeholder="Search to add song..." className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-[#FFB703]" />
                </div>
                {songResults.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {songResults.map(s => (
                      <div key={s.id} onClick={() => { if (!dnaSongs.find(x => x.id === s.id)) setDnaSongs([...dnaSongs, s]); setSongQuery(""); setSongResults([]); }} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100">
                        {s.thumbnail && <img src={s.thumbnail} className="w-8 h-8 rounded object-cover" alt="" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">{s.artist}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Genres & Vibes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Genres (Max 5)</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button key={g} onClick={() => setDnaGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : prev.length < 5 ? [...prev, g] : prev)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${dnaGenres.includes(g) ? 'bg-[#FFB703] text-[#1A1A1A]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-3">Core Vibe</h3>
                  <div className="flex flex-wrap gap-2">
                    {VIBES.map(v => (
                      <button key={v} onClick={() => setDnaVibes(prev => prev.includes(v) ? [] : [v])} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${dnaVibes.includes(v) ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{v}</button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          <div className="mt-10 flex justify-end items-center gap-4 border-t pt-6">
            {toast.message && <span className={`font-bold text-sm ${toast.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{toast.message}</span>}
            <button onClick={handleSave} disabled={saving} className="bg-[#1A1A1A] text-white px-8 py-3 rounded-full font-bold hover:bg-[#FFB703] hover:text-[#1A1A1A] transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
