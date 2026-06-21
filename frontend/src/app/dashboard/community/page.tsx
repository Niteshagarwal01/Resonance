"use client";

import { Users, Globe2, Radio, MessageSquare, Loader2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ChatRoom } from "@/components/ChatRoom";

export default function CommunityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [vibeRooms, setVibeRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: profiles } = await supabase.from('profiles').select('*');
        const { data: dnas } = await supabase.from('taste_dna').select('*');
        
        if (profiles) {
          // Merge profiles with their DNA
          const merged = profiles.map(p => ({
            ...p,
            dna: dnas?.find(d => d.user_id === p.id) || null
          }));
          setUsers(merged);

          // Group by core_vibe to create rooms
          const rooms: Record<string, any[]> = {};
          merged.forEach(u => {
            const vibe = u.dna?.core_vibe || "General Chat";
            const cleanVibe = vibe.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim();
            if (!rooms[cleanVibe]) rooms[cleanVibe] = [];
            rooms[cleanVibe].push(u);
          });

          // Convert to array and sort by popularity
          const roomArr = Object.entries(rooms).map(([name, members]) => ({
            name,
            members,
            count: members.length
          })).sort((a, b) => b.count - a.count);

          setVibeRooms(roomArr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (activeRoom) {
    return (
      <div className="p-8 pb-32">
        <ChatRoom roomName={activeRoom} onLeave={() => setActiveRoom(null)} />
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-black text-[#1A1A1A] mb-4 flex items-center gap-4">
          Community <Users className="text-emerald-500" size={40} />
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Music is social. Join global listening rooms, share your Taste DNA, and debate the latest drops.
        </p>
      </div>

      {/* Vibe Rooms */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
          <Zap size={24} className="text-[#FFB703]"/> Vibe Rooms
        </h2>
        
        {loading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1,2,3,4].map(i => <div key={i} className="w-64 h-32 bg-gray-100 rounded-3xl animate-pulse shrink-0"></div>)}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x">
            {vibeRooms.map((room, idx) => (
              <div key={idx} onClick={() => setActiveRoom(room.name)} className="shrink-0 w-72 bg-gradient-to-br from-[#1A1A1A] to-gray-900 rounded-3xl p-6 text-white shadow-xl snap-start cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Radio size={20} className="text-[#FFB703]" />
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {room.count} active
                  </div>
                </div>
                <h3 className="text-xl font-black capitalize mb-1">{room.name}</h3>
                <p className="text-gray-400 text-sm mb-4">Live listening & chat</p>
                <div className="flex -space-x-2">
                  {room.members.slice(0, 5).map((m: any, i: number) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-gray-600 overflow-hidden">
                      {m.avatar_url ? <img src={m.avatar_url} alt={`${m.username}'s avatar`} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-xs">{m.username?.[0] || '?'}</div>}
                    </div>
                  ))}
                  {room.members.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] bg-gray-800 flex items-center justify-center text-xs font-bold">
                      +{room.members.length - 5}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Activity Feed */}
      <div>
        <h2 className="text-2xl font-black text-[#1A1A1A] mb-6 flex items-center gap-2">
          <Globe2 size={24} className="text-blue-500"/> Global Activity
        </h2>
        
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 max-w-4xl">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" /> Loading global activity...
            </div>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No recent activity found. Be the first to start a listening room!</p>
          ) : (
            users.map((u, idx) => (
              <div key={u.id || idx} onClick={() => setActiveRoom(u.dna?.core_vibe?.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() || 'General')} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors p-2 rounded-xl cursor-pointer group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFB703] to-[#8ECAE6] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} alt={`${u.username}'s avatar`} className="w-full h-full object-cover" /> : <Users size={16} className="text-white" />}
                </div>
                <div>
                  <p className="text-[#1A1A1A]">
                    <span className="font-bold">{u.full_name || u.username || 'Anonymous User'}</span> 
                    {u.dna ? ` joined the ${u.dna.core_vibe?.replace(/[🌙🧠💪☕💔✨📼🎉🌊🚗📚💕]/g, "").trim() || 'General'} vibe room!` : ' joined Resonance and is setting up their Taste DNA!'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {u.dna?.top_songs?.[0] ? `Recently saved "${u.dna.top_songs[0].title}"` : 'Recently active'}
                  </p>
                </div>
                <button className="ml-auto text-gray-400 group-hover:text-[#FFB703] transition-colors">
                  <MessageSquare size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
