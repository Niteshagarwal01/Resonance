"use client";

import { Sidebar } from "@/components/Sidebar";
import { BottomPlayer } from "@/components/BottomPlayer";
import { PlayerProvider } from "@/context/PlayerContext";
import { Monitor, LogOut } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Check if onboarding is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("has_completed_onboarding")
        .eq("id", session.user.id)
        .single();

      if (profile && !profile.has_completed_onboarding) {
        router.push("/onboarding");
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#FDFBF7]">
      <div className="w-12 h-12 border-4 border-[#FFB703]/20 border-t-[#FFB703] rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <PlayerProvider>
      <div className="flex flex-col h-screen bg-[#FDFBF7] overflow-hidden font-sans">
        
        {/* Top Area: Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Subtle blobs for the light theme */}
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8ECAE6] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
          </div>

          <Sidebar />

          <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10 bg-white ml-2 mt-2 mb-2 mr-2 rounded-3xl shadow-sm border border-gray-100">
            {children}
          </main>
        </div>

        {/* Persistent Bottom Player */}
        <BottomPlayer />

        {/* Mobile Blocker - Redesigned & Fixed */}
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
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex w-full justify-center items-center gap-2 bg-white text-[#1A1A1A] px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </PlayerProvider>
  );
}
