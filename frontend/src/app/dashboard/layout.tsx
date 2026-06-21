"use client";

import { Sidebar } from "@/components/Sidebar";
import { BottomPlayer } from "@/components/BottomPlayer";
import { PlayerProvider } from "@/context/PlayerContext";

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

          <main className="flex-1 overflow-y-auto scrollbar-hide relative z-10">
            {children}
          </main>
        </div>

        {/* Persistent Bottom Player */}
        <BottomPlayer />
      </div>
    </PlayerProvider>
  );
}
