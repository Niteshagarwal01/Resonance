"use client";

import { Logo } from "@/components/Logo";
import { MobileBlocker } from "@/components/MobileBlocker";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans relative overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[700px] h-[700px] bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[180px] opacity-10" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-[#8ECAE6] rounded-full mix-blend-multiply filter blur-[180px] opacity-10" />
      </div>

      {/* Single clean header */}
      <header className="relative z-20 w-full px-8 py-6 flex items-center justify-between border-b border-black/5 bg-[#FDFBF7]/80 backdrop-blur-sm">
        <Logo variant="horizontal" size={28} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FFB703]">
          Taste DNA Setup
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 py-12">
        {children}
      </main>

      {/* Mobile Blocker */}
      <MobileBlocker showLogout={true} />
    </div>
  );
}
