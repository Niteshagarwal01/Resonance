"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, ArrowLeft, Users, Music2, Radio, Play, Disc } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { SafeImage as Image } from "@/components/SafeImage";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  text: string;
  created_at: string;
}

interface JamSession {
  hostId: string;
  hostName: string;
  track: any;
  isPlaying: boolean;
  progress: number;
}

export function ChatRoom({ roomName, onLeave }: { roomName: string, onLeave: () => void }) {
  const { currentTrack, isPlaying, progress, playTrack, seekTo } = usePlayer();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Jam Session State
  const [isHosting, setIsHosting] = useState(false);
  const [activeJam, setActiveJam] = useState<JamSession | null>(null);
  const [jamListeners, setJamListeners] = useState<any[]>([]);

  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setCurrentUser(profile || { id: session.user.id, username: "Anonymous" });

      // Fetch 24-hour history from DB
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: history } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_name', roomName)
        .gte('created_at', yesterday)
        .order('created_at', { ascending: true });

      if (history) setMessages(history);
      setLoading(false);

      // Clean up any existing channel with this name
      supabase.getChannels().forEach(c => {
        if (c.topic === `realtime:room:${roomName}`) {
          supabase.removeChannel(c);
        }
      });

      // Create a Supabase Realtime channel for this specific room
      const channel = supabase.channel(`room:${roomName}`, {
        config: { broadcast: { self: true }, presence: { key: session.user.id } }
      });

      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_name=eq.${roomName}` }, (payload) => {
          // Handle messages from DB
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as ChatMessage];
          });
        })
        .on('broadcast', { event: 'jam_sync' }, ({ payload }) => {
          if (payload.hostId !== session.user.id) {
            setActiveJam(payload as JamSession);
          }
        })
        .on('broadcast', { event: 'jam_join' }, ({ payload }) => {
          setJamListeners(prev => {
            if (prev.find(u => u.userId === payload.userId)) return prev;
            return [...prev, payload];
          });
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          setOnlineCount(Object.keys(state).length || 1);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ online_at: new Date().toISOString() });
          }
        });

      channelRef.current = channel;
    }
    initChat();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [roomName, supabase]);

  // Broadcast Jam Session State
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHosting && currentTrack && channelRef.current && currentUser) {
      interval = setInterval(() => {
        channelRef.current.send({
          type: 'broadcast',
          event: 'jam_sync',
          payload: {
            hostId: currentUser.id,
            hostName: currentUser.username,
            track: currentTrack,
            isPlaying,
            progress
          }
        });
      }, 3000); // broadcast every 3s
    } else {
      setJamListeners([]); // Clear listeners if we stop hosting
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isHosting, currentTrack, isPlaying, progress, currentUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;

    const text = input.trim();
    setInput("");

    // Insert to DB (Postgres changes will broadcast it back to everyone including us)
    await supabase.from('chat_messages').insert({
      room_name: roomName,
      user_id: currentUser.id,
      username: currentUser.username || currentUser.full_name || "User",
      avatar_url: currentUser.avatar_url,
      text: text
    });
  };

  const tuneIn = () => {
    if (!activeJam || !activeJam.track || !currentUser) return;
    
    // Notify host we tuned in
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'jam_join',
        payload: { userId: currentUser.id, username: currentUser.username || "Listener", avatarUrl: currentUser.avatar_url }
      });
    }

    playTrack(activeJam.track, [activeJam.track]);
    setTimeout(() => {
      seekTo(activeJam.progress);
    }, 1000); // Wait for track to load before seeking
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FDFBF7]">
        <div className="flex items-center gap-4">
          <button onClick={onLeave} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] capitalize">{roomName} Room</h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {onlineCount} Listening Live
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsHosting(!isHosting)}
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
              isHosting 
                ? 'bg-red-500 text-white shadow-md animate-pulse' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {isHosting ? <Radio size={16} className="animate-ping" /> : <Music2 size={16} className="text-[#FFB703]" />}
            {isHosting ? 'Stop Broadcasting' : 'Host Jam Session'}
          </button>
        </div>
      </div>

      {/* Host Banner (Shows who is listening to you) */}
      {isHosting && currentTrack && (
        <div className="bg-[#1A1A1A] text-white px-6 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative overflow-hidden shrink-0">
              <Radio size={16} className="text-[#FFB703] animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[#FFB703] font-bold uppercase tracking-wider">You are Broadcasting</p>
              <p className="text-sm font-medium truncate">Playing <span className="font-bold">{currentTrack.title}</span></p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-2">
              {jamListeners.slice(0, 3).map((l, i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-[#1A1A1A] bg-gray-600 overflow-hidden" title={l.username}>
                  {l.avatarUrl ? <img src={l.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-[8px]">{l.username.substring(0,2)}</div>}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-400 font-bold">{jamListeners.length} Tuned In</span>
          </div>
        </div>
      )}

      {/* Jam Banner for Listeners */}
      {activeJam && !isHosting && (
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center relative overflow-hidden shrink-0">
              <Disc size={16} className={activeJam.isPlaying ? "animate-spin" : ""} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-200 font-bold uppercase tracking-wider">Live Jam Session</p>
              <p className="text-sm font-medium truncate">
                <span className="font-bold">{activeJam.hostName}</span> is playing <span className="font-bold">{activeJam.track.title}</span>
              </p>
            </div>
          </div>
          <button onClick={tuneIn} className="shrink-0 px-4 py-1.5 bg-white text-blue-600 rounded-full text-xs font-black shadow hover:scale-105 transition-transform flex items-center gap-2">
            <Play size={12} fill="currentColor" /> Tune In
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <Users size={48} className="text-gray-200" />
            <p className="font-medium">Welcome to the {roomName} room!</p>
            <p className="text-sm">Say hi to start the jam session.</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.user_id === currentUser?.id;
            return (
              <div key={msg.id || i} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-1 flex items-center justify-center">
                  {msg.avatar_url ? (
                    <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-gray-500">{msg.username.substring(0,2).toUpperCase()}</span>
                  )}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-bold text-gray-400 mb-1 px-1">{msg.username}</span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-[#FFB703] text-[#1A1A1A] rounded-tr-sm font-medium' 
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or share a track..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB703]/50 focus:border-[#FFB703] transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="w-12 h-12 rounded-full bg-[#1A1A1A] hover:bg-[#FFB703] text-white hover:text-[#1A1A1A] flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-[#1A1A1A] disabled:hover:text-white"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
