"use client";

import { Sidebar } from "@/components/Sidebar";
import { BottomPlayer } from "@/components/BottomPlayer";
import { PlayerProvider } from "@/context/PlayerContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
