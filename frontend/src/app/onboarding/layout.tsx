"use client";

import { Logo } from "@/components/Logo";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#FFB703] rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-[#8ECAE6] rounded-full mix-blend-multiply filter blur-[150px] opacity-20"></div>
      </div>

      <header className="absolute top-0 left-0 w-full p-8 z-20 flex justify-between items-center">
        <Logo variant="horizontal" size={32} />
        <div className="text-sm font-bold tracking-widest uppercase text-gray-400">
          Taste DNA Setup
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 pt-32 pb-24">
        {children}
      </main>
    </div>
  );
}
