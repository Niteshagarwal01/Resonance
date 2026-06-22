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

          {/* Mobile Blocker */}
          <div className="md:hidden absolute inset-0 z-50 bg-[#FDFBF7] flex flex-col items-center justify-center p-8 text-center">
            <Monitor size={64} className="text-[#FFB703] mb-6" />
            <h1 className="text-3xl font-black text-[#1A1A1A] mb-4 tracking-tight">Laptop Only</h1>
            <p className="text-gray-500 font-medium mb-8 max-w-sm">
              Resonance is currently optimized for larger screens. An official mobile app is coming soon! Please switch to a laptop or tablet for the full experience.
            </p>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex items-center gap-2 bg-white border border-gray-200 text-[#1A1A1A] px-6 py-3 rounded-full font-bold shadow-sm hover:border-gray-300 hover:shadow-md transition-all"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>

          <Sidebar />

          <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10 bg-white ml-2 mt-2 mb-2 mr-2 rounded-3xl shadow-sm border border-gray-100">
            {children}
          </main>
        </div>

        {/* Persistent Bottom Player */}
        <BottomPlayer />
      </div>
    </PlayerProvider>
  );
}
