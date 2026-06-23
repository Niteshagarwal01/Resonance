"use client";

import { Monitor, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function MobileBlocker({ showLogout = false }: { showLogout?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="md:hidden fixed inset-0 z-[9999] bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#FFB703] rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-[#8ECAE6] rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse" style={{ animationDelay: "1s" }}></div>
      
      <div className="relative z-10 flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-[#FFB703] to-orange-500 rounded-2xl rotate-3 flex items-center justify-center mb-6 shadow-lg shadow-[#FFB703]/20">
          <div className="-rotate-3">
            <Monitor size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Desktop Only</h1>
        <p className="text-gray-300 font-medium mb-8 leading-relaxed text-sm">
          Resonance is built for the big screen. Switch to a laptop or tablet for the full, immersive music experience. Mobile app coming soon!
        </p>
        
        {showLogout ? (
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="flex w-full justify-center items-center gap-2 bg-white text-[#1A1A1A] px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut size={18} /> Log Out
          </button>
        ) : (
          <button 
            onClick={() => router.push("/")}
            className="flex w-full justify-center items-center gap-2 bg-white text-[#1A1A1A] px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
