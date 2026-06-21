"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Send, ArrowLeft, Users, Music2 } from "lucide-react";
import Image from "next/image";

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  text: string;
  timestamp: number;
}

export function ChatRoom({ roomName, onLeave }: { roomName: string, onLeave: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const supabase = createClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function initChat() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setCurrentUser(profile || { id: session.user.id, username: "Anonymous" });

      // Create a Supabase Realtime channel for this specific room
      const channel = supabase.channel(`room:${roomName}`, {
        config: { broadcast: { self: true }, presence: { key: session.user.id } }
      });

      channel
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages(prev => [...prev, payload as ChatMessage]);
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomName, supabase]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentUser || !channelRef.current) return;

    const msg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      user_id: currentUser.id,
      username: currentUser.username || currentUser.full_name || "User",
      avatar_url: currentUser.avatar_url,
      text: input.trim(),
      timestamp: Date.now(),
    };

    channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: msg
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#FDFBF7]">
        <div className="flex items-center gap-4">
          <button onClick={onLeave} className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] capitalize">{roomName}</h2>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {onlineCount} Listening Live
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <Music2 size={14} className="text-[#FFB703]" />
            <span className="text-xs font-bold text-gray-600">Jam Session Active</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.length === 0 ? (
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
