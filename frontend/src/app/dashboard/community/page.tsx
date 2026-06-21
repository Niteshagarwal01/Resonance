"use client";

import { Users, Globe2, Radio, MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function CommunityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(10);
        if (data) {
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

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
              <div key={u.id || idx} className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors p-2 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFB703] to-[#8ECAE6] rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : <Users size={16} className="text-white" />}
                </div>
                <div>
                  <p className="text-[#1A1A1A]">
                    <span className="font-bold">{u.full_name || u.username || 'Anonymous User'}</span> joined Resonance and is setting up their Taste DNA!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Recently</p>
                </div>
                <button className="ml-auto text-gray-400 hover:text-[#FFB703] transition-colors">
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
