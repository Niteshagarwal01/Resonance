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
      <div className="flex h-screen bg-[#FDFBF7] overflow-hidden font-sans">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide relative bg-white m-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
            {/* Subtle blobs for the light theme */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8ECAE6] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
          </div>
          
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>

        {/* Persistent Bottom Player */}
        <BottomPlayer />
      </div>
    </PlayerProvider>
  );
}
